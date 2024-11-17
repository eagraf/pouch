import React, { useState, useEffect } from 'react';
import './LinkList.css';
import Cookies from 'js-cookie';
import { LinkRecord } from '../types/LinkTypes';
import { addTagToLink, fetchLinksV2 } from '../api/api';
interface Link {
  id: number;
  url: string;
  title: string;
  tags: string[];
  dateAdded: string; // Assuming date is a string in ISO format
}

interface LinkListProps {
  links: Link[];
}

const LinkList: React.FC<LinkListProps> = () => {
  //const [filter, setFilter] = useState<string>('');

//  const filteredLinks = links
    //.filter(link => filter === '' || link.tags.includes(filter))
    //.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

  //const uniqueTags = Array.from(new Set(links.flatMap(link => link.tags)));

  const [links, setLinks] = useState<LinkRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredLinks, setFilteredLinks] = useState<LinkRecord[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const userDID = Cookies.get('user_did');
        if (!userDID) {
          throw new Error('User DID not found.');
        }
        const data = await fetchLinksV2();
        setLinks(data);
      // @ts-expect-error TODO fix this
      } catch (err: Error) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadLinks();
  }, []);

  useEffect(() => {
    if (selectedTags.size === 0) {
      setFilteredLinks(links);
    } else {
      setFilteredLinks(
        links.filter(link => {
          const linkTags = new Set(link.value.tags);
          return Array.from(selectedTags).every(tag => linkTags.has(tag));
        })
      );
    }
  }, [selectedTags, links]);

  const handleTagClick = (tag: string) => {
    const newSelectedTags = new Set(selectedTags);
    if (newSelectedTags.has(tag)) {
      newSelectedTags.delete(tag);
    } else {
      newSelectedTags.add(tag);
    }
    setSelectedTags(newSelectedTags);
  };

  const getUniqueTags = (): string[] => {
    const tagSet = new Set<string>();
    links.forEach(link => {
      link.value.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  };

  const handleAddTag = async (linkUrl: string, newTag: string) => {
    // TODO: Implement the logic to add a new tag to a link
    console.log(`Adding tag ${newTag} to link ${linkUrl}`);
    try {
      await addTagToLink(linkUrl, newTag);
      console.log(`Successfully added tag ${newTag} to link ${linkUrl}`);
      
      // Force a re-render by fetching updated links
      const updatedLinks = await fetchLinksV2();
      setLinks(updatedLinks);
    } catch (error) {
      console.error('Error adding tag:', error);
      // Optionally, you can set an error state here to display to the user
    }
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="link-container">
        <div className="tag-filter">
        {getUniqueTags().map((tag, index) => (
          <span
            key={index}
            className={`filter-tag ${selectedTags.has(tag) ? 'selected' : ''}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </span>
        ))}
      </div>
        <ul className="link-list">
        {filteredLinks.map((link, index) => (
          <li key={index} className="link-item">
            <a href={link.value.url} target="_blank" rel="noopener noreferrer" className="link-title">
              {link.value.url}
            </a>
            <div className="link-tags">
              {link.value.tags && link.value.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="link-tag">{tag}</span>
              ))}
              <AddTagButton link={link} onAddTag={handleAddTag} />
            </div>
            <div className="link-date">
              {new Date(link.value.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </li>
        ))}
        </ul>
    </div>
  );
};

interface AddTagButtonProps {
  link: LinkRecord;
  onAddTag: (linkId: string, newTag: string) => void;
}

const AddTagButton: React.FC<AddTagButtonProps> = ({ link, onAddTag }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddTag(link.value.url, newTag.trim());
      setNewTag('');
      setIsAdding(false);
    }
  };

  return (
    <>
      {isAdding ? (
        <form onSubmit={handleSubmit} className="add-tag-form">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag"
            className="add-tag-form-input"
          />
          <button 
            type="submit"
            className="add-tag-form-button"
            title="Accept"
          >
            ✓
          </button>
          <button
            type="button" 
            onClick={() => setIsAdding(false)}
            className="add-tag-form-button"
            title="Cancel"
          >
            ✕
          </button>
        </form>
      ) : (
        <button onClick={() => setIsAdding(true)} className="add-tag-button">+ Add Tag</button>
      )}
    </>
  );
};

export default LinkList;