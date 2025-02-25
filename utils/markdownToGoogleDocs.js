// Function to remove '**' bold markers from markdown text
function removeBoldMarkers(markdown) {
  return markdown.replace(/\*\*(.*?)\*\*/g, '$1');
}

// Modified parseMarkdown function
export function parseMarkdown(markdown, workgroup, date) {
  // Remove bold markers before processing
  markdown = removeBoldMarkers(markdown);

  const requests = [];
  let currentIndex = 1;

  const lines = markdown.split('\n');
  let listLevel = 0; // Keeping this for possible indentation handling

  lines.forEach((line) => {
    let text = line + '\n';
    let headingLevel = 0;

    // Check for headings
    if (line.startsWith('#### ')) {
      headingLevel = 4;
      text = text.substring(5);
    } else if (line.startsWith('### ')) {
      headingLevel = 3;
      text = text.substring(4);
    } else if (line.startsWith('## ')) {
      headingLevel = 2;
      text = text.substring(3);
    } else if (line.startsWith('# ')) {
      headingLevel = 1;
      text = text.substring(2);
    }

    // Check for links in the format [text](url)
    const linkRegex = /\[(.*?)\]\((.*?)\)/;
    const linkMatch = linkRegex.exec(text);

    if (linkMatch) {
      const linkText = linkMatch[1]; // Text to display
      const linkUrl = linkMatch[2];  // URL to link to

      const beforeLinkText = text.substring(0, linkMatch.index);
      const afterLinkText = text.substring(linkMatch.index + linkMatch[0].length);

      // Insert text before the link
      if (beforeLinkText) {
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: beforeLinkText,
          },
        });
        currentIndex += beforeLinkText.length;
      }

      // Insert the link text
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: linkText,
        },
      });

      // Apply the link formatting
      requests.push({
        updateTextStyle: {
          range: {
            startIndex: currentIndex,
            endIndex: currentIndex + linkText.length,
          },
          textStyle: { link: { url: linkUrl } },
          fields: 'link',
        },
      });

      currentIndex += linkText.length;

      // Insert text after the link
      if (afterLinkText) {
        requests.push({
          insertText: {
            location: { index: currentIndex },
            text: afterLinkText,
          },
        });
        currentIndex += afterLinkText.length;
      }
    } else {
      // Insert text
      requests.push({
        insertText: {
          location: { index: currentIndex },
          text: text,
        },
      });
      currentIndex += text.length;
    }

    // Apply formatting
    if (headingLevel > 0) {
      requests.push({
        updateParagraphStyle: {
          range: {
            startIndex: currentIndex - text.length,
            endIndex: currentIndex - 1,
          },
          paragraphStyle: {
            namedStyleType: `HEADING_${headingLevel}`,
          },
          fields: 'namedStyleType',
        },
      });
    }

    // Bold formatting is no longer needed as we removed the markers
  });

  return requests;
}