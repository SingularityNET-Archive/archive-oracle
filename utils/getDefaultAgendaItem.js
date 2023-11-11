export const getDefaultAgendaItem = () => ({
    agenda: "",
    status: "carry over",
    narrative: "",
    issues: [""],
    actionItems: [{ text: "", assignee: "", dueDate: "", status: "todo" }],
    decisionItems: [{ decision: "", rationale: "", opposing: "", effect: "affectsOnlyThisWorkgroup" }],
    discussionPoints: [""],
    learningPoints: [""]
});
