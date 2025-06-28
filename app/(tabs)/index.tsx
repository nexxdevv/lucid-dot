import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient" // Import LinearGradient
import React, { useEffect, useState } from "react"
import {
  FlatList,
  LayoutAnimation,
  Modal, // Import UIManager for Android
  Platform, // Import Platform for OS check
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, // Import LayoutAnimation
  UIManager,
  View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface Card {
  statement: string
  tags: string[]
  author: string
}

interface Deck {
  id: string
  title: string
  cards: Card[]
}

export default function DeckManager() {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [decks, setDecks] = useState<Deck[]>([])
  const [currentDeckTitle, setCurrentDeckTitle] = useState("")
  const [currentCards, setCurrentCards] = useState<Card[]>([])
  const [newStatement, setNewStatement] = useState("")
  const [newTags, setNewTags] = useState("")
  const [modalVisible, setModalVisible] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingDeckCards, setEditingDeckCards] = useState<Card[]>([])
  const [editStatement, setEditStatement] = useState("")
  const [editTags, setEditTags] = useState("")
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null)
  const [editTagInput, setEditTagInput] = useState("") // Renamed for clarity and consistency
  const [editTagList, setEditTagList] = useState<string[]>([])

  const navigation = useNavigation<any>()

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = async () => {
    const saved = await AsyncStorage.getItem("userDecks")
    if (saved) setDecks(JSON.parse(saved))
  }

  const saveDecks = async (decksToSave: Deck[]) => {
    await AsyncStorage.setItem("userDecks", JSON.stringify(decksToSave))
  }

  const handleTagInputChange = (text: string) => {
    setEditTagInput(text)
  }

  const addCardToCurrentDeck = () => {
    if (!newStatement.trim()) return
    LayoutAnimation.easeInEaseOut() // Animate layout changes
    const card: Card = {
      statement: newStatement,
      tags: newTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      author: "User"
    }
    setCurrentCards((prev) => [...prev, card])
    setNewStatement("")
    setNewTags("")
  }

  const saveCurrentDeck = () => {
    if (!currentDeckTitle.trim() || currentCards.length === 0) return
    LayoutAnimation.easeInEaseOut() // Animate layout changes
    const newDeck: Deck = {
      id: Date.now().toString(),
      title: currentDeckTitle.trim(),
      cards: currentCards
    }
    const updatedDecks = [...decks, newDeck]
    setDecks(updatedDecks)
    saveDecks(updatedDecks)
    setCurrentDeckTitle("")
    setCurrentCards([])
    setModalVisible(false)
  }

  const openEditModal = (index: number) => {
    setEditIndex(index)
    setEditingDeckCards(decks[index].cards)
    setEditModalVisible(true)
  }

  const addCardToEditDeck = () => {
    if (!editStatement.trim()) return
    LayoutAnimation.easeInEaseOut() // Animate layout changes

    const updatedCards =
      editingCardIndex !== null
        ? editingDeckCards.map((card, i) =>
            i === editingCardIndex
              ? {
                  ...card,
                  statement: editStatement,
                  tags: editTagList
                    .filter(Boolean)
                    .map((tag) => tag.toLowerCase())
                }
              : card
          )
        : [
            ...editingDeckCards,
            {
              statement: editStatement,
              tags: editTagList.filter(Boolean).map((tag) => tag.toLowerCase()),
              author: "User"
            }
          ]

    setEditingDeckCards(updatedCards)
    const updatedDeck = {
      ...decks[editIndex!],
      cards: updatedCards
    }
    updateDeck(updatedDeck, false)
    setEditStatement("")
    setEditTagInput("") // Use the renamed state setter
    setEditTagList([])
    setEditingCardIndex(null)
  }

  const deleteCardFromEditDeck = (index: number) => {
    LayoutAnimation.easeInEaseOut() // Animate layout changes
    const updatedCards = editingDeckCards.filter((_, i) => i !== index)
    setEditingDeckCards(updatedCards)
    const updatedDeck = {
      ...decks[editIndex!],
      cards: updatedCards
    }
    updateDeck(updatedDeck, false)
  }

  const updateDeck = (updated: Deck, closeModal = true) => {
    const updatedDecks = decks.map((deck, i) =>
      i === editIndex ? updated : deck
    )
    setDecks(updatedDecks)
    saveDecks(updatedDecks)
    if (closeModal) setEditModalVisible(false)
  }

  const deleteDeck = () => {
    if (editIndex === null) return
    LayoutAnimation.easeInEaseOut() // Animate layout changes
    const updated = decks.filter((_, i) => i !== editIndex)
    setDecks(updated)
    saveDecks(updated)
    setEditModalVisible(false)
  }

  const handleSelectDeck = (deck: Deck) => {
    navigation.navigate("lucid", { deck })
  }

  const addTagToList = (tagToAdd: string = editTagInput) => {
    const trimmed = tagToAdd.trim().toLowerCase()
    if (trimmed && !editTagList.includes(trimmed)) {
      LayoutAnimation.easeInEaseOut() // Animate layout changes
      setEditTagList([...editTagList, trimmed])
      setEditTagInput("") // Clear input after adding
      setShowSuggestions(false) // Hide suggestions
    }
  }

  const removeTag = (index: number) => {
    LayoutAnimation.easeInEaseOut() // Animate layout changes
    setEditTagList(editTagList.filter((_, i) => i !== index))
  }

  const allTags = Array.from(
    new Set(
      decks.flatMap((deck) =>
        deck.cards.flatMap((card) => card.tags.filter(Boolean))
      )
    )
  )

  const suggestedTags = editTagInput
    ? allTags.filter(
        (tag) =>
          tag.toLowerCase().includes(editTagInput.toLowerCase()) &&
          !editTagList.includes(tag.toLowerCase())
      )
    : allTags.filter((tag) => !editTagList.includes(tag.toLowerCase()))

  return (
    <LinearGradient
      colors={["#e0f2f7", "#a7d9ed"]} // Very light blue to a slightly darker blue
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.header}>Your Decks</Text>
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.deckCard}
              onPress={() => handleSelectDeck(item)}
              activeOpacity={0.7} // Add active opacity for better feedback
            >
              <LinearGradient
                colors={["#ffffff", "#f0f4f7"]} // Soft white to light grey
                style={styles.deckCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.deckTitle}>{item.title}</Text>
                {item.cards.length > 0 && (
                  <View style={styles.cardPreviewContainer}>
                    <Text style={styles.deckPreview}>
                      {item.cards[0].statement}
                    </Text>
                    <View style={styles.tagsContainer}>
                      {item.cards[0].tags.map((tag, tagIndex) => (
                        <View key={tagIndex} style={styles.tagBubble}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContentContainer}
        />
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={["#8ecae6", "#219ebc"]} // Soft blue to deeper blue
            style={styles.createButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.createText}>+ Create New Deck</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>

      {editIndex !== null && (
        <Modal
          visible={editModalVisible}
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <LinearGradient
            colors={["#e0f2f7", "#a7d9ed"]}
            style={styles.modalContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <SafeAreaView style={styles.safeArea}>
              <Text style={styles.modalTitle}>Edit Deck</Text>
              <TextInput
                style={styles.input}
                placeholder="Statement"
                placeholderTextColor="#a0aec0"
                value={editStatement}
                onChangeText={setEditStatement}
                multiline={true} // Allow multiple lines for statements
              />
              <View style={styles.tagListContainer}>
                {editTagList.filter(Boolean).map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => removeTag(index)}
                    style={styles.activeTagBubble}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.activeTagText}>
                      {tag.toLowerCase()} ×
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]} // Adjust margin for row layout
                  placeholder="Add tag"
                  placeholderTextColor="#a0aec0"
                  value={editTagInput}
                  onChangeText={handleTagInputChange}
                  onSubmitEditing={() => addTagToList(editTagInput)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 100)
                  }
                />
                <TouchableOpacity
                  onPress={() => addTagToList(editTagInput)}
                  style={styles.addTagButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addTagButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              {showSuggestions && suggestedTags.length > 0 && (
                <View style={styles.suggestedTagsContainer}>
                  {suggestedTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => {
                        addTagToList(tag)
                      }}
                      style={styles.suggestedTagBubble}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.suggestedTagText}>
                        {tag.toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={addCardToEditDeck}
                style={styles.primaryButton}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={["#8ecae6", "#219ebc"]} // Soft blue to deeper blue
                  style={styles.primaryButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>
                    {editingCardIndex !== null
                      ? "Update Card"
                      : "+ Add New Card"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <FlatList
                data={[...editingDeckCards].reverse()}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.cardListItem}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditStatement(item.statement)
                        setEditTagList(
                          item.tags.map((tag) => tag.toLowerCase())
                        )
                        setEditingCardIndex(index)
                      }}
                      style={styles.cardContent}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cardListItemStatement}>
                        {item.statement}
                      </Text>
                      {item.tags.length > 0 && (
                        <View style={styles.cardListItemTags}>
                          {item.tags.map((tag, tagIdx) => (
                            <View key={tagIdx} style={styles.tagBubbleSmall}>
                              <Text style={styles.tagTextSmall}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteCardFromEditDeck(index)}
                      style={styles.deleteCardButton}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteCardText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
                contentContainerStyle={styles.cardListContainer}
              />
              <TouchableOpacity
                onPress={deleteDeck}
                style={styles.deleteDeckButton}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteDeckText}>Delete Entire Deck</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.secondaryButton}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      )}

      {/* Modal for Create New Deck (similar styles to Edit Modal) */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <LinearGradient
          colors={["#e0f2f7", "#a7d9ed"]}
          style={styles.modalContent}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <SafeAreaView style={styles.safeArea}>
            <Text style={styles.modalTitle}>Create New Deck</Text>
            <TextInput
              style={styles.input}
              placeholder="Deck Title"
              placeholderTextColor="#a0aec0"
              value={currentDeckTitle}
              onChangeText={setCurrentDeckTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Statement for First Card"
              placeholderTextColor="#a0aec0"
              value={newStatement}
              onChangeText={setNewStatement}
              multiline={true}
            />
            <TextInput
              style={styles.input}
              placeholder="Tags (comma-separated, e.g., focus, calm)"
              placeholderTextColor="#a0aec0"
              value={newTags}
              onChangeText={setNewTags}
            />
            <TouchableOpacity
              onPress={addCardToCurrentDeck}
              style={styles.primaryButton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#90ee90", "#3cb371"]} // Soft green to darker green
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>+ Add Card</Text>
              </LinearGradient>
            </TouchableOpacity>
            <FlatList
              data={currentCards}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <View style={styles.cardListItem}>
                  <Text style={styles.cardListItemStatement}>
                    {item.statement}
                  </Text>
                  {item.tags.length > 0 && (
                    <View style={styles.cardListItemTags}>
                      {item.tags.map((tag, tagIdx) => (
                        <View key={tagIdx} style={styles.tagBubbleSmall}>
                          <Text style={styles.tagTextSmall}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
              contentContainerStyle={styles.cardListContainer}
            />
            <TouchableOpacity
              onPress={saveCurrentDeck}
              style={styles.primaryButton}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={["#8ecae6", "#219ebc"]} // Soft blue to deeper blue
                style={styles.primaryButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Save Deck</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.secondaryButton}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical:  35// Add padding for Android status bar
  },
  header: {
    fontSize: 34,
    fontWeight: "700", // Semibold
    color: "#334155", // Darker text for contrast
    marginBottom: 24,
    marginTop: 20,
    textAlign: "center"
  },
  listContentContainer: {
    paddingBottom: 100 // Make space for the create button
  },
  deckCard: {
    marginBottom: 16,
    borderRadius: 18,
    overflow: "hidden", // Ensure gradient respects border radius
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8 // Android shadow
  },
  deckCardGradient: {
    padding: 20,
    position: "relative"
  },
  deckTitle: {
    fontSize: 22,
    fontWeight: "600", // Semibold
    color: "#2d3748", // Darker gray for title
    marginBottom: 8
  },
  cardPreviewContainer: {
    borderTopWidth: StyleSheet.hairlineWidth, // Fine separator line
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
    marginTop: 12
  },
  deckPreview: {
    fontSize: 16,
    color: "#4a5568", // Medium gray
    lineHeight: 24,
    marginBottom: 8
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4
  },
  tagBubble: {
    backgroundColor: "rgba(102, 126, 234, 0.1)", // Light, semi-transparent purple/blue
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.2)"
  },
  tagText: {
    color: "#667eea", // Corresponding purple/blue
    fontSize: 13,
    fontWeight: "500" // Medium
  },
  editButton: {
    position: "absolute",
    right: 20,
    top: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.05)" // Subtle background
  },
  editText: {
    color: "#4299e1", // A calm blue
    fontSize: 15,
    fontWeight: "500"
  },
  createButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 30, // Larger border radius for a pill shape
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12
  },
  createButtonGradient: {
    paddingVertical: 18,
    alignItems: "center"
  },
  createText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700"
  },

  // Modal Styles
  modalContent: {
    flex: 1
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 24,
    marginTop: 20,
    textAlign: "center"
  },
  input: {
    backgroundColor: "white",
    borderColor: "#e2e8f0",
    borderWidth: StyleSheet.hairlineWidth, // Fine border
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#2d3748",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3
  },
  tagListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12
  },
  activeTagBubble: {
    backgroundColor: "#90ee90", // A soft green
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  activeTagText: {
    color: "#2f855a", // Darker green
    fontSize: 14,
    fontWeight: "500"
  },
  tagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  addTagButton: {
    marginLeft: 10,
    backgroundColor: "#8ecae6", // Soft blue
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 50, // Fixed width for a square button
    height: 50, // Fixed height for a square button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  addTagButtonText: {
    color: "white",
    fontSize: 24, // Larger plus sign
    fontWeight: "bold"
  },
  suggestedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16
  },
  suggestedTagBubble: {
    backgroundColor: "#e2e8f0", // Light gray background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1"
  },
  suggestedTagText: {
    color: "#4a5568", // Medium gray text
    fontSize: 14,
    fontWeight: "400"
  },
  primaryButton: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8
  },
  primaryButtonGradient: {
    paddingVertical: 16,
    alignItems: "center"
  },
  primaryButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600"
  },
  cardListContainer: {
    paddingTop: 10,
    paddingBottom: 20 // Add some bottom padding
  },
  cardListItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4
  },
  cardContent: {
    flex: 1,
    marginRight: 10
  },
  cardListItemStatement: {
    fontSize: 16,
    color: "#2d3748",
    fontWeight: "500",
    marginBottom: 4
  },
  cardListItemTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4
  },
  tagBubbleSmall: {
    backgroundColor: "rgba(102, 126, 234, 0.08)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4
  },
  tagTextSmall: {
    color: "#667eea",
    fontSize: 12
  },
  deleteCardButton: {
    padding: 8
  },
  deleteCardText: {
    color: "#ef4444", // Red for delete
    fontSize: 14,
    fontWeight: "500"
  },
  deleteDeckButton: {
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#ff6b6b", // Softer red
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8
  },
  deleteDeckText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600"
  },
  secondaryButton: {
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#cbd5e1", // Light gray for secondary action
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3
  },
  secondaryButtonText: {
    color: "#4a5568",
    fontSize: 17,
    fontWeight: "600"
  }
})
