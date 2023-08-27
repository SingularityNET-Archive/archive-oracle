import { Octokit } from "@octokit/rest";
import { format, getWeek, startOfWeek, endOfWeek, parse, isBefore } from "date-fns";

export const commitToGithub = async (formData: any, token: string) => {
  const octokit = new Octokit({ auth: token });

  const dateObj = new Date(formData.date);
  const year = format(dateObj, "yyyy");
  const month = format(dateObj, "MMMM-yyyy").toLowerCase();
  const week = `week-${getWeek(dateObj)}`;

  const owner = "Andre-Diamond";
  const repo = "test";
  const path = `timeline/${year}/${month}/${week}.md`;

  try {
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: "heads/main",
    });

    const { data: commitData } = await octokit.repos.getCommit({
      owner,
      repo,
      ref: "heads/main",
    });

    let metadata = '';
    let existingContent = '';

    try {
      const { data: existingFile } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      if ('content' in existingFile && existingFile.content) {
        const allContent = Buffer.from(existingFile.content, 'base64').toString();
        const contentSplit = allContent.split('##');
        metadata = contentSplit[0].trim();
        existingContent = contentSplit.slice(1).join('##').trim();
      }
    } catch (err) {
      const startWeek = startOfWeek(dateObj);
      const endWeek = endOfWeek(dateObj);
      metadata = `---
description: ${format(startWeek, 'do MMMM yyyy')} to ${format(endWeek, 'do MMMM yyyy')}
---

# Week ${getWeek(dateObj)}`;
    }

    const formattedDate = format(dateObj, "EEEE do MMMM yyyy");
    const newWorkgroupSection = `### ${formData.workgroup}\n\n${formData.meetingSummary}\n`;

    const dateSections = existingContent ? existingContent.split('\n## ').filter(section => section.trim()) : [];

    let newContentArray = [];
    let dateInserted = false;

    for (let section of dateSections) {
      const [sectionDateLine, ...rest] = section.split('\n');
      const sectionDate = parse(sectionDateLine, "EEEE do MMMM yyyy", new Date());

      if (isBefore(dateObj, sectionDate) && !dateInserted) {
        newContentArray.push(`${formattedDate}\n\n${newWorkgroupSection}`);
        dateInserted = true;
      }

      if (sectionDateLine === formattedDate) {
        section = `${sectionDateLine}\n\n${rest.join('\n')}\n\n${newWorkgroupSection}`;
        dateInserted = true;
      }

      // Fix for the '## #' issue, we replace it with '###'
      section = section.replace('## #', '###');
      newContentArray.push(section);
    }

    if (!dateInserted) {
      newContentArray.push(`${formattedDate}\n\n${newWorkgroupSection}`);
    }

    const newContent = `${metadata}\n\n## ${newContentArray.join('\n## ').trim()}`;

    const { data: createBlobData } = await octokit.git.createBlob({
      owner,
      repo,
      content: newContent,
      encoding: "utf-8",
    });

    const { data: createTreeData } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: commitData.commit.tree.sha,
      tree: [
        {
          path,
          mode: "100644",
          type: "blob",
          sha: createBlobData.sha,
        },
      ],
    });

    const { data: createCommitData } = await octokit.git.createCommit({
      owner,
      repo,
      message: `Add ${formData.date}-${formData.workgroup} meeting summary`,
      tree: createTreeData.sha,
      parents: [refData.object.sha],
    });

    await octokit.git.updateRef({
      owner,
      repo,
      ref: "heads/main",
      sha: createCommitData.sha,
    });

    return "Commit Successful";
  } catch (err: any) {
    return `Commit Failed: ${err.message}`;
  }
};
