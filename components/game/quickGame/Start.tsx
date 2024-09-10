import Image, { ImageLoader } from 'next/image';
import Link from 'next/link';
// import gamePic from './../../../public/quick-answer-fox.png';

// const baseUrl = process.env.NEXTAUTH_URL;

// const imageLoader: ImageLoader = ({ src, width, quality }) => {
//   return `${baseUrl}/${src}?w=${width}&q=${quality || 75}`;
// };

const StartQuickAnswerGame: React.FC = () => {
  return (
    <>
      <Link href={'/game/quick-answer'}>
        <div className="grid grid-cols-2 gap-4 h-full items-center cursor-pointer">
          <div className="flex justify-center items-center">
            <div>
              <h3 className="text-3xl text-center">Quick Answer Game</h3>
            </div>
          </div>

          <div className="flex justify-center items-center">
            {/* <Image loader={imageLoader} width={300} height={300} src={gamePic} alt="Quick Answer Game Fox Picture" /> */}
            <Image width={300} height={300} src="/quick-answer-fox.png" alt="Quick Answer Game Fox Picture" />
          </div>
        </div>
      </Link>
    </>
  );
};

export default StartQuickAnswerGame;
