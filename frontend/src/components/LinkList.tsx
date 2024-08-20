import React, { useState, useEffect } from 'react';
import './LinkList.css';
import Cookies from 'js-cookie';
import { LinkRecord } from '../types/LinkTypes';
import fetchLinks from '../api/api';

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
        const data = await fetchLinks(
          userDID!, 
          'com.habitat.pouch.link' // Collection
        );
        setLinks(data);
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="link-container">
        <h1>Fetched Links</h1>
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
              { link.value.tags && link.value.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="link-tag">{tag}</span>
              ))}
          </div>
          <div className="link-date">
            {new Date(link.value.createdAt).toLocaleString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </li>
        ))}
        </ul>
    </div>
  );
};

export default LinkList;