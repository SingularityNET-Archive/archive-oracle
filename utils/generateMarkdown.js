/*
 * Markdown Generator for Meeting Summaries
 * 
 * This function, generateMarkdown, is designed to convert meeting summary data into a structured markdown format.
 * It processes various components of a meeting summary, including:
 * - Basic meeting information such as date, name, host, and purpose.
 * - Links to meeting-related resources like media, Miro boards, and transcripts.
 * - Detailed sections like action items, decision items, discussion points, and more.
 * - Agenda items, presented in an ordered or default format based on the 'order' parameter.
 * - Tags and keywords related to the meeting, covering topics and emotions.
 * 
 * The function handles the absence of summary data by returning a relevant message.
 * Each section of the meeting summary is formatted according to predefined markdown patterns.
 * The output is a comprehensive markdown text that can be used for documentation or display purposes.
 * 
 * Key features:
 * - Versatile processing of diverse meeting information.
 * - Customizable order of agenda items.
 * - Error handling for missing summary data.
 * - Rich markdown formatting for clear and readable output.
 */

function capitalize(text) {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function generateMarkdown(summary, order) {
  
  let markdown = "";
  if (!summary) {
    console.log('No summary provided');
    return 'No Summary present'; 
  }
  // Process meetingInfo
  if (summary.meetingInfo) {
    const { date, name, host, documenter, translator, peoplePresent, purpose, googleSlides, townHallNumber, otherMediaLink, meetingVideoLink, mediaLink, miroBoardLink, transcriptLink, workingDocs, timestampedVideo } = summary.meetingInfo;

    // Add meeting information to markdown
    if ( name && !summary.canceledSummary && !summary.noSummaryGiven ) markdown += `- **Type of meeting:** ${name}\n`;
    if (host || documenter || translator || peoplePresent) {
      markdown += `- **Present:** `;
      if (host) markdown += `${host} [**facilitator**], `;
      if (documenter) markdown += `${documenter} [**documenter**], `;
      if (translator) markdown += `${translator} [**translator**], `;
      if (peoplePresent) markdown += `${peoplePresent.split(', ').map(p => p.trim()).join(', ')}`;
      markdown += '\n';
    }
    if (purpose) markdown += `- **Purpose:** ${purpose}\n`;
    if (townHallNumber) markdown += `- **Town Hall Number:** ${townHallNumber}\n`; //townHallNumber
    if (meetingVideoLink) markdown += `- **Meeting video:** [Link](${meetingVideoLink})\n`;
    if (mediaLink) markdown += `- **Media link:** [Link](${mediaLink})\n`;
    if (miroBoardLink) markdown += `- **Miro board:** [Link](${miroBoardLink})\n`;
    if (transcriptLink) markdown += `- **Transcript:** [Link](${transcriptLink})\n`;
    if (otherMediaLink) markdown += `- **Other media:** [Link](${otherMediaLink})\n`;
    //markdown += '\n';

    // Process workingDocs
    if (workingDocs && Array.isArray(workingDocs) && workingDocs.length > 0) {
      markdown += `- **Working Docs:**\n`;
      workingDocs.forEach(doc => {    
        if (doc.link) {
          markdown += `  - [${doc.title}](${doc.link})\n`;
        }
      });
      markdown += `\n`
    }

     // Process timestampedVideo if it's a string
     if (timestampedVideo && typeof timestampedVideo.timestamps === 'string') {
      const { url, intro } = timestampedVideo;
      markdown += `\n#### Timestamped video:\n`;
      if (url) markdown += `{% embed url="${url}" %}\n\n`;
      if (intro) markdown += `${intro}\n\n`;

      // Parse the timestamps string and convert each to a link
      const lines = timestampedVideo.timestamps.split('\n');
      lines.forEach(line => {
        const [time, title] = line.split(/(?<=^\S+)\s/); // Splits at the first space after a non-whitespace sequence
        if (time && title) {
          const parts = time.split(':').map(t => parseInt(t, 10));
          let totalSeconds = 0;
          if (parts.length === 3) {
            totalSeconds = parts[2] + parts[1] * 60 + parts[0] * 3600;
          } else if (parts.length === 2) {
            totalSeconds = parts[1] + parts[0] * 60;
          } else if (parts.length === 1) {
            totalSeconds = parts[0];
          }
          markdown += `[${time}](${url}\\&t=${totalSeconds}s) ${capitalize(title)}\n`;
        }
      });
      markdown += `\n`;
    } 
    
    if (googleSlides) {
      markdown += `\n#### Slides:\n`;
      markdown += `{% embed url="${googleSlides}" %}\n\n`;
    }
  }

  function getOrdinal(n) {
    const ordinals = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0]);
  }

  // Generic function to format items
  const formatItems = (title, items, itemType) => {
    let sectionContent = '';
    if (itemType === 'townHallUpdates' || itemType === 'narrative' || itemType === 'gameRules' || itemType === 'townHallSummary' || itemType === 'discussion') {
      if (items.trim()) {  // Check if narrative or gameRules are not empty
        sectionContent = `${items}\n\n`;
      }
    } else {
      items.forEach((item, index) => {
        let line = '';
        switch (itemType) {
          case 'actionItems':
            if (item.text) {
              line = `- [**action**] ${item.text}`;
              if (item.assignee) line += ` [**assignee**] ${item.assignee}`;
              if (item.dueDate) line += ` [**due**] ${item.dueDate}`;
              if (item.status) line += ` [**status**] ${item.status}`;
              line += '\n';
            }
            break;
          case 'decisionItems':
            if (item.decision) {
              line = `- ${item.decision}\n`;
              if (item.rationale) line += `  - [**rationale**] ${item.rationale}\n`;
              if (item.opposing) line += `  - [**opposing**] ${item.opposing}\n`;
              if (item.effect) line += `  - [**effect**] ${item.effect}\n`;
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
  };

  // Function to process and add each agenda item type to markdown
  const processAgendaItem = (itemType, item) => {
    switch(itemType) {
      case 'townHallUpdates':
        if (item.townHallUpdates) formatItems("Town Hall Updates", item.townHallUpdates, 'townHallUpdates');
        break;
      case 'townHallSummary':
        if (item.townHallSummary) formatItems("Town Hall Summary", item.townHallSummary, 'townHallSummary');
        break;
      case 'narrative':
        if (item.narrative) formatItems("Narrative", item.narrative, 'narrative');
        break;
      case 'discussion':
        if (item.discussion) formatItems("Discussion", item.discussion, 'discussion');
        break;
      case 'actionItems':
        if (item.actionItems && item.actionItems.length > 0) formatItems("Action Items", item.actionItems, 'actionItems');
        break;
      case 'decisionItems':
        if (item.decisionItems && item.decisionItems.length > 0) formatItems("Decision Items", item.decisionItems, 'decisionItems');
        break;
      case 'discussionPoints':
        if (item.discussionPoints && item.discussionPoints.length > 0) {
          if (summary.workgroup == "Onboarding Workgroup" || summary.workgroup == "AI Sandbox/Think-tank") {
            formatItems("In this meeting we discussed", item.discussionPoints, 'discussionPoints');
          } else {
            formatItems("Discussion Points", item.discussionPoints, 'discussionPoints');
          }
        }
        break;
      case 'learningPoints':
        if (item.learningPoints && item.learningPoints.length > 0) formatItems("Learning Points", item.learningPoints, 'learningPoints');
        break;
      case 'meetingTopics':
        if (item.meetingTopics && item.meetingTopics.length > 0) {
          if (summary.workgroup == "Education Workgroup") {
            formatItems("In this meeting we discussed", item.meetingTopics, 'meetingTopics');
          } else if (summary.workgroup == "Research and Development Guild") {
            formatItems("Agenda Items", item.meetingTopics, 'meetingTopics');
          } else if (summary.workgroup == "WG Sync Call") {
            formatItems("Agenda Items", item.meetingTopics, 'meetingTopics');
          } else {
            formatItems("Meeting Topics", item.meetingTopics, 'meetingTopics');
          }
        }  
        break;
      case 'issues':
        if (item.issues && item.issues.length > 0) {
          if (summary.workgroup == "Onboarding Workgroup" || summary.workgroup == "AI Sandbox/Think-tank") {
            formatItems("To carry over for next meeting", item.issues, 'issues');
          } else if (summary.workgroup == "WG Sync Call") {
            formatItems("To carry over for next meeting", item.issues, 'issues');
          } else {
            formatItems("Issues", item.issues, 'issues');
          }
        }
        break;
      case 'gameRules':
        if (item.gameRules) formatItems("Game Rules", item.gameRules, 'gameRules');
        break;
      case 'leaderboard':
        if (item.leaderboard && item.leaderboard.length > 0) formatItems("Leaderboard", item.leaderboard, 'leaderboard');
        break;
      // add other cases as needed
    }
  };

  // Process agendaItems according to the specified order
  summary.agendaItems?.forEach((item, index) => {
    if (item.agenda) {
      markdown += `#### Agenda item ${index + 1} - ${item.agenda} - [${item.status}]\n\n`;
    }
  
    if (order) {
      order.forEach(itemType => {
        processAgendaItem(itemType, item);
      });
    } else {
      //console.warn("Order is undefined. Items will not be ordered based on 'orderMapping'.");
      // Optionally, handle the scenario when order is undefined
    }
  });

  // Process tags
  if (summary.tags) {
    const { topicsCovered, references, emotions, other, gamesPlayed } = summary.tags;
    if (topicsCovered || emotions || other || gamesPlayed) markdown += `#### Keywords/tags:\n`;
    if (topicsCovered) markdown += `- **topics covered:** ${topicsCovered}\n`;
    if (emotions) markdown += `- **emotions:** ${emotions}\n`;
    if (other) markdown += `- **other:** ${other}\n`;
    if (gamesPlayed) markdown += `- **games played:** ${gamesPlayed}\n`;
  }

  if (summary.noSummaryGiven == true) {
    markdown += `No Summary Given \n`;
  }
  //canceledSummary
  if (summary.canceledSummary == true) {
    markdown += `Meeting was cancelled \n`;
  }
  return markdown;
};
