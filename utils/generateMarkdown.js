export function generateMarkdown(summary) {
    let markdown = "";
    //console.log("summary", summary)
    if (!summary) {
      console.log('No summary provided');
      return 'No Summary present'; 
    }
    if (summary.meetingInfo) {
      const { date, name, host, documenter, peoplePresent, purpose, mediaLink, miroBoardLink, transcriptLink } = summary.meetingInfo;
      
      //const formattedDate = new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      //markdown += `## ${formattedDate}\n\n`;
      //markdown += `### ${summary.workgroup}\n\n`;
      markdown += `- Type of meeting: ${name}\n`;
      markdown += `- People present: ${host} [host], ${documenter} [documenter], ${peoplePresent.split(', ').map(p => p.trim()).join(', ')}\n`;
      markdown += `- Purpose: ${purpose}\n`;
      if (mediaLink) markdown += `- Meeting video: ${mediaLink}\n`;
      if (miroBoardLink) markdown += `- Miro board: ${miroBoardLink}\n`;
      if (transcriptLink) markdown += `- Transcript: ${transcriptLink}\n`;
      markdown += '\n';
    }
  
    summary.agendaItems?.forEach((item, index) => {
      if (item.agenda) {
        markdown += `#### Agenda item ${index + 1} - ${item.agenda} - [${item.status}]\n\n`;
      }
      //Narrative
      if (item.narrative) {
        markdown += `#### Narrative:\n`;
        markdown += `${item.narrative}\n`
        markdown += '\n\n';
      }
      // Issues
      if (item.issues && item.issues.length > 0) {
        markdown += `#### Issues:\n`;
        item.issues.forEach(point => {
          markdown += `- ${point}\n`;
        });
        markdown += '\n';
      }
      // Action Items
      if (item.actionItems && item.actionItems.length > 0) {
        markdown += `#### Action Items:\n`;
        item.actionItems.forEach(actionItem => {
          markdown += `- [action] ${actionItem.text} [assignee] ${actionItem.assignee} [due] ${actionItem.dueDate} [status] ${actionItem.status}\n`;
        });
        markdown += '\n';
      }
  
      // Decision Items
      if (item.decisionItems && item.decisionItems.length > 0) {
        markdown += `#### Decision Items:\n`;
        item.decisionItems.forEach(decisionItem => {
          markdown += `- ${decisionItem.decision}\n`;
          if (decisionItem.rationale) markdown += `  - [rationale] ${decisionItem.rationale}\n`;
          if (decisionItem.opposing) markdown += `  - [opposing] ${decisionItem.opposing}\n`;
          if (decisionItem.effect) markdown += `  - [effect] ${decisionItem.effect}\n`;
        });
        markdown += '\n';
      }
  
      // Discussion Points
      if (item.discussionPoints && item.discussionPoints.length > 0 && item.discussionPoints[0] != '') {
        markdown += `#### Discussion points:\n`;
        item.discussionPoints.forEach(point => {
          markdown += `- ${point}\n`;
        });
        markdown += '\n';
      }
    });
  
    // Tags
    if (summary.tags) {
      const { topicsCovered, references, emotions, other } = summary.tags;
      markdown += `#### Keywords/tags:\n`;
      if (topicsCovered) markdown += `- topics covered: ${topicsCovered}\n`;
      if (references) markdown += `- references: ${references}\n`;
      if (emotions) markdown += `- emotions: ${emotions}\n`;
      if (other) markdown += `- other: ${other}\n`;
    }
  
    return markdown;
};
  