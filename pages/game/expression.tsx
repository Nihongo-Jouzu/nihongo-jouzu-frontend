import React, { useState, useEffect } from 'react';
import { getFetchBackendURL } from '@/utils/utils-data';
import { getSession, useSession } from 'next-auth/react';
import Link from 'next/link';

interface ContentItem {
  content_id: number;
  japanese_slang: string;
  english_slang: string;
  formal_version: string;
  description: string;
}

const ExpressionPage: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLearning, setIsLearning] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<number>();

  const { data: session, status } = useSession({ required: true });

  // get user info
  useEffect(() => {
    getSession().then((session) => {
      setUserInfo(session?.user.pk);
    });
  }, []);

  // Fetch data from the API when the component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      const fetchData = async () => {
        try {
          // const response = await fetch('http://localhost:8000/api/content');
          const response = await fetch(getFetchBackendURL(`/api/content-unlearned/${session?.user.pk}/`));
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data: ContentItem[] = await response.json();
          setContent(data);
        } catch (error) {
          console.error('Error fetching content:', error);
        }
      };
      fetchData();
    }
  }, [status]);

  const handleStartLearning = () => {
    setIsLearning(true);
  };

  const handleNextContent = async () => {
    if (content.length > 0) {
      // Prepare data to be sent
      const currentContentId = content[currentIndex].content_id;

      // Send POST request to record learned word
      try {
        const response = await fetch(getFetchBackendURL('/api/words-learned/create'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: userInfo,
            content: currentContentId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to record learned word');
        }

        // go to the next content
        setCurrentIndex((prevIndex) => (prevIndex + 1) % content.length);
      } catch (error) {
        console.error('Error posting learned word:', error);
      }
    }
  };

  const handlePreviousContent = () => {
    if (content.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + content.length) % content.length);
    }
  };

  const isFirstCard = currentIndex === 0;
  const isLastCard = content.length > 0 && currentIndex === content.length - 1;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!isLearning ? (
        <button
          className="px-9 py-4 text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600"
          onClick={handleStartLearning}
        >
          Start Learning
        </button>
      ) : (
        <div className="max-w-lg p-6 bg-white rounded-lg shadow-lg">
          {content.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-4">{content[currentIndex].japanese_slang}</h2>
              <p className="mb-2">
                <strong>English Slang:</strong> {content[currentIndex].english_slang}
              </p>
              <p className="mb-2">
                <strong>Formal Version:</strong> {content[currentIndex].formal_version}
              </p>
              <p className="mb-4">
                <strong>Description:</strong> {content[currentIndex].description}
              </p>
              <div className="flex justify-center">
                {!isFirstCard && (
                  <button
                    className="px-4 py-2 text-white bg-red-500 rounded-lg shadow-md hover:bg-red-600"
                    onClick={handlePreviousContent}
                  >
                    Back
                  </button>
                )}
                {!isLastCard && (
                  <button
                    className={`px-4 py-2 text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 ${isFirstCard ? '' : 'ml-24'}`}
                    onClick={handleNextContent}
                  >
                    Next
                  </button>
                )}
              </div>
              {isLastCard && (
                <p className="mt-4 text-xl font-semibold text-red-600">
                  You have reached the end of the content! All the material is available in the flash cards to practice.
                </p>
              )}
            </>
          ) : (
            <p className="text-lg text-gray-700">No content available.</p>
          )}
        </div>
      )}
      <div className="mb-4">
        <Link href={{ pathname: '/game/flash-card', query: { userInfo } }} passHref>
          <div className="mt-4 px-4 py-3 text-white bg-purple-500 rounded-lg shadow-md hover:bg-purple-600 cursor-pointer">
            Go to Flashcards
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ExpressionPage;
