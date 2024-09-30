import Cookies from 'js-cookie';
import { LinkRecord } from '../types/LinkTypes';


export async function fetchLinksV2(): Promise<LinkRecord[]> {
    const token = Cookies.get('access_token');
    const habitatDomain = Cookies.get('habitat_domain');

    if (!token) {
        throw new Error('Authentication token not found.');
    }
    const url = `https://${habitatDomain}/pouch_api/api/v1/links`;


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
        console.log(data);

        // Transform the data to match LinkRecord structure
        const transformedData: LinkRecord[] = data.map((item: any) => ({
            uri: item.uri,
            cid: item.cid,
            value: {
                url: item.uri,
                created_at: item.created_at,
                tags: item.tags || [],
            }
        }));
        console.log(transformedData);

        return transformedData;
    } catch (error) {
        console.error('Error fetching links:', error);
        throw error;
    }
}

export async function addTagToLink(uri: string, tag: string): Promise<void> {
    const token = Cookies.get('access_token');
    const habitatDomain = Cookies.get('habitat_domain');

    if (!token) {
        throw new Error('Authentication token not found.');
    }

    const url = `https://${habitatDomain}/pouch_api/api/v1/tag`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uri, tag }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Tag added successfully:', data);
    } catch (error) {
        console.error('Error adding tag:', error);
        throw error;
    }
}
