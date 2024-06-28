import Modal from '../components/Modal.jsx';
import useFileSystem from '../hooks/useFileSystem.js';

function WelcomeModal ({ onClose, onSetFs }) {
  const [,, openFolder] = useFileSystem();

  const handleChooseFolder = async () => {
    const newFs = await openFolder()
    onSetFs(newFs);
    onClose();
  }

  return (
    <Modal onClose={onClose} title="Choose a project">
      <p>Select a folder on your computer that will store your project.</p>
      <button onClick={handleChooseFolder}>Choose Folder</button>
    </Modal>
  )
}

export default WelcomeModal;
