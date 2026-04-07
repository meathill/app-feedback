import AdminHeader from './_components/admin-header';
import AdminToolbar from './_components/admin-toolbar';
import FeedbackList from './_components/feedback-list';
import Pagination from './_components/pagination';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <AdminHeader />
        <AdminToolbar />
        <FeedbackList />
        <Pagination />
      </div>
    </div>
  );
}
