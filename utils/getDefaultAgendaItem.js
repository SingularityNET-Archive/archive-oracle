// ../utils/getDefaultAgendaItem.js
export const getDefaultAgendaItem = () => ({
    agenda: "",
    status: "carry over",
    townHallUpdates: "",
    townHallSummary: "",
    narrative: "",
    discussion: "",
    gameRules: "",
    leaderboard: [""],
    meetingTopics: [""],
    issues: [""],
    actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
    decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "" }],
    discussionPoints: [""],
    learningPoints: [""],
});
