import React from 'react';

type TagsProps = {
  tags: { topicsCovered: string, references: string, emotions: string },
  setTags: React.Dispatch<React.SetStateAction<{ topicsCovered: string, references: string, emotions: string }>>
}

const Tags: React.FC<TagsProps> = ({ tags, setTags }) => {
  return (
    <div>
      <h3>Tags</h3>
      <input 
        type="text"
        placeholder="Topics Covered"
        value={tags.topicsCovered}
        onChange={(e) => setTags({ ...tags, topicsCovered: e.target.value })}
      />
      <input 
        type="text"
        placeholder="References"
        value={tags.references}
        onChange={(e) => setTags({ ...tags, references: e.target.value })}
      />
      <input 
        type="text"
        placeholder="Emotions"
        value={tags.emotions}
        onChange={(e) => setTags({ ...tags, emotions: e.target.value })}
      />
    </div>
  );
};

export default Tags;
