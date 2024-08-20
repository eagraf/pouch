import Cookies from 'js-cookie';
import { LinkRecord } from '../types/LinkTypes';

async function fetchLinks(
  repo: string,
  collection: string,
): Promise<LinkRecord[]> {
    const token = Cookies.get('access_token');
    const habitatDomain = Cookies.get('habitat_domain');
    console.log("COOKIE " + document.cookie);
    Cookies.set('abcd', "123");
  
    console.log("AHGH");
    if (!token) {
        throw new Error('Authentication token not found.');
    }

    const url = `https://${habitatDomain}/xrpc/com.atproto.repo.listRecords?repo=${encodeURIComponent(repo)}&collection=${encodeURIComponent(collection)}`;
    console.log(url);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        return data.records
    } catch (error) {
        console.error('Error fetching links:', error);
        throw error;
    }
}

export default fetchLinks;
