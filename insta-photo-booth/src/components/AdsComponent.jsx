export default function AdsComponent({ videoSrc, onGoClick }) {
    return (
      <div className="ads-container">
        <video src={videoSrc} autoPlay muted loop />
        <footer className="footer">
          <button className="go-button" onClick={onGoClick}>
            GO
          </button>
        </footer>
      </div>
    );
  }