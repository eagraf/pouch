import LinkList from '../../components/LinkList';
import './Home.css'

function Home() {
    const links = [
    {
        id: 1,
        url: 'https://example.com',
        title: 'Example Site',
        tags: ['tech', 'news'],
        dateAdded: '2024-08-15T14:48:00.000Z',
    },
    {
        id: 2,
        url: 'https://anotherexample.com',
        title: 'Another Example',
        tags: ['blog', 'personal'],
        dateAdded: '2024-08-14T10:20:00.000Z',
    },
    // Add more links here
    ];

    return (
    <div>
        <h1>🦘 My Links</h1>
        <LinkList links={links} />
    </div>
    );
}

export default Home
