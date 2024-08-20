export interface LinkRecord {
    uri: string;
    cid: string;
    value: {
        url: string;
        createdAt: string;
        tags: string[];
    };
}
