export function parseMarkdown(markdown, workgroup, date) {
  const requests = [];
  let currentIndex = 1;

  // Add header text
  const headerText = `Meeting Summary for ${workgroup}\nDate: ${date}\n\n`;
  requests.push({
    insertText: {
      location: { index: currentIndex },
      text: headerText,
    },
  });
  currentIndex += headerText.length;

  // Apply heading style to the title
  requests.push({
    updateParagraphStyle: {
      range: {
        startIndex: 1,
        endIndex: headerText.indexOf('\n') + 1,
      },
      paragraphStyle: {
        namedStyleType: 'HEADING_1',
      },
      fields: 'namedStyleType',
    },
  });

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

    // Apply bold formatting
    let boldStart = -1;
    for (let i = 0; i < text.length; i++) {
      if (text.substring(i, i + 2) === '**') {
        if (boldStart === -1) {
          boldStart = i;
        } else {
          requests.push({
            updateTextStyle: {
              range: {
                startIndex: currentIndex - text.length + boldStart + 2,
                endIndex: currentIndex - text.length + i,
              },
              textStyle: { bold: true },
              fields: 'bold',
            },
          });
          boldStart = -1;
        }
      }
    }
  });

  return requests;
}
