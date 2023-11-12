export function generateMarkdown(summary) {
  let markdown = "";
  if (!summary) {
    console.log('No summary provided');
    return 'No Summary present'; 
  }

  // Process meetingInfo
  if (summary.meetingInfo) {
    const { date, name, host, documenter, peoplePresent, purpose, mediaLink, miroBoardLink, transcriptLink } = summary.meetingInfo;
    //console.log(summary)
    // Add meeting information to markdown
    markdown += `- Type of meeting: ${name}\n`;
    markdown += `- People present: ${host} [host], ${documenter} [documenter], ${peoplePresent.split(', ').map(p => p.trim()).join(', ')}\n`;
    markdown += `- Purpose: ${purpose}\n`;
    if (mediaLink) markdown += `- Meeting video: ${mediaLink}\n`;
    if (miroBoardLink) markdown += `- Miro board: ${miroBoardLink}\n`;
    if (transcriptLink) markdown += `- Transcript: ${transcriptLink}\n`;
    markdown += '\n';
  }
  function getOrdinal(n) {
    const ordinals = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0]);
  }
  // Generic function to format items
  const formatItems = (title, items, itemType) => {
    let sectionContent = '';
    if (itemType === 'narrative' || itemType === 'gameRules') {
      if (items.trim()) {  // Check if narrative or gameRules are not empty
        sectionContent = `${items}\n\n`;
      }
    } else {
      items.forEach((item, index) => {
        let line = '';
        switch (itemType) {
          case 'actionItems':
            if (item.text) {
              line = `- [action] ${item.text}`;
              if (item.assignee) line += ` [assignee] ${item.assignee}`;
              if (item.dueDate) line += ` [due] ${item.dueDate}`;
              if (item.status) line += ` [status] ${item.status}`;
              line += '\n';
            }
            break;
          case 'decisionItems':
            if (item.decision) {
              line = `- ${item.decision}\n`;
              if (item.rationale) line += `  - [rationale] ${item.rationale}\n`;
              if (item.opposing) line += `  - [opposing] ${item.opposing}\n`;
              if (item.effect) line += `  - [effect] ${item.effect}\n`;
            }
            break;
          case 'leaderboard':
            if (item) {line = `- ${getOrdinal(index + 1)} ${item}\n`};
            break;
          default:
            if (item) line = `- ${item}\n`;
        }
        sectionContent += line;
      });
    }
    if (sectionContent) {
      markdown += `#### ${title}:\n${sectionContent}\n`;
    }
  }

  // Process agendaItems and their contents
  summary.agendaItems?.forEach((item, index) => {
    if (item.agenda) {
      markdown += `#### Agenda item ${index + 1} - ${item.agenda} - [${item.status}]\n\n`;
    }
    if (item.narrative) {
      formatItems("Narrative", item.narrative, 'narrative');
    }
    if (item.actionItems && item.actionItems.length > 0) {
      formatItems("Action Items", item.actionItems, 'actionItems');
    }
    if (item.decisionItems && item.decisionItems.length > 0) {
      formatItems("Decision Items", item.decisionItems, 'decisionItems');
    }
    if (item.discussionPoints && item.discussionPoints.length > 0) {
      formatItems("Discussion Points", item.discussionPoints, 'discussionPoints');
    }
    if (item.learningPoints && item.learningPoints.length > 0) {
      formatItems("Learning Points", item.learningPoints, 'learningPoints');
    }
    if (item.issues && item.issues.length > 0) {
      formatItems("Issues", item.issues, 'issues');
    }
    if (item.gameRules) {
      formatItems("Game Rules", item.gameRules, 'gameRules');
    }
    if (item.leaderboard && item.leaderboard.length > 0) {
      formatItems("Leaderboard", item.leaderboard, 'leaderboard');
    }
  });

  // Process tags
  if (summary.tags) {
    const { topicsCovered, references, emotions, other, gamesPlayed } = summary.tags;
    markdown += `#### Keywords/tags:\n`;
    if (topicsCovered) markdown += `- topics covered: ${topicsCovered}\n`;
    if (references) markdown += `- references: ${references}\n`;
    if (emotions) markdown += `- emotions: ${emotions}\n`;
    if (other) markdown += `- other: ${other}\n`;
    if (gamesPlayed) markdown += `- games played: ${gamesPlayed}\n`;
  }

  return markdown;
};

