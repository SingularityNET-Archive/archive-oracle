export const getDefaultAgendaItem = () => ({
    agenda: "",
    status: "carry over",
    narrative: "",
    gameRules: "",
    leaderboard: [""],
    issues: [""],
    actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
    decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
    discussionPoints: [""],
    learningPoints: [""]
});
