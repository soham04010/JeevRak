import petKnowledge from './petKnowledge.json';

interface KnowledgeItem {
    keywords: string[];
    answer: string;
}

/**
 * Chatbot logic specific to JeevRak app.
 * Matches user input against predefined keywords in petKnowledge.json.
 */
export const getBotResponse = (userMessage: string): string => {
    if (!userMessage) return "Aa question mate information available nathi 🐾";

    const cleanMessage = userMessage.toLowerCase().trim();

    // Find the first matching answer
    const matchedItem = (petKnowledge as KnowledgeItem[]).find((item) => {
        return item.keywords.some((keyword) => cleanMessage.includes(keyword.toLowerCase()));
    });

    if (matchedItem) {
        return matchedItem.answer;
    }

    // Fallback if no match found
    return "Aa question mate information available nathi 🐾";
};
