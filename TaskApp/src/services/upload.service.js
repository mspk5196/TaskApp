import api from './api';

const uploadService = {
  uploadProof: (file, additionalData) =>
    api.uploadFile('/upload/proof', file, 'file', additionalData),
};

export default uploadService;
