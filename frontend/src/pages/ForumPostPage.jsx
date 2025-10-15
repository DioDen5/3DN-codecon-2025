import { useParams } from 'react-router-dom';
import PostExpanded from '../components/PostExpanded';

export default function ForumPostPage() {
    const { id } = useParams();
    return <PostExpanded id={id} />;
}
