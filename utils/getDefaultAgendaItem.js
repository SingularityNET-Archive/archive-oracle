export const getDefaultAgendaItem = () => ({
    agenda: "",
    status: "carry over",
    townHallUpdates: "",
    narrative: "",
    gameRules: "",
    leaderboard: [""],
    meetingTopics: [""],
    issues: [""],
    actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
    decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "" }],
    discussionPoints: [""],
    learningPoints: [""],
});
