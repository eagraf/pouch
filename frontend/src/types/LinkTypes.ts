export interface LinkRecord {
    uri: string;
    cid: string;
    value: {
        url: string;
        created_at: string;
        tags: string[];
    };
}
