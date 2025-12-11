import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Feedback } from '@/types';
import Link from 'next/link';

export const runtime = 'edge';

export default async function Home(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const { env } = getCloudflareContext();
  const page = parseInt((searchParams.page as string) || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  // Fetch data
  const { results: feedbacks } = await env.DB.prepare(
    `SELECT 
      id, 
      app_id as appId, 
      version, 
      content, 
      contact, 
      device_info as deviceInfo, 
      location, 
      status, 
      created_at as createdAt 
     FROM feedbacks 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
  )
    .bind(limit, offset)
    .all<Feedback>();

  // Get total count for pagination
  // D1 .run() returns meta, .all() returns results. But "SELECT COUNT..." returns a row.
  // Actually .run() is for write usually, but can be used. But .all() is better for reading.
  // Let's use .all() for count as well.

  const { results: countResults } = await env.DB.prepare('SELECT COUNT(*) as total FROM feedbacks').all<{
    total: number;
  }>();

  const total = countResults[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">App Feedbacks</h1>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total: {total}</div>
        </header>

        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {feedbacks.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No feedbacks found.</li>
            ) : (
              feedbacks.map((feedback) => (
                <li key={feedback.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                        {feedback.appId}
                        {feedback.version && <span className="ml-2 text-gray-500">v{feedback.version}</span>}
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            feedback.status === 'processed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {feedback.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {feedback.content}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="sm:flex">
                        {feedback.contact && (
                          <div className="mr-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
                            📧 {feedback.contact}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          📅 {new Date(feedback.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">ID: {feedback.id}</div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div>
            {page > 1 && (
              <Link
                href={`/?page=${page - 1}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </Link>
            )}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Page {page} of {totalPages || 1}
          </div>
          <div>
            {page < totalPages && (
              <Link
                href={`/?page=${page + 1}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
