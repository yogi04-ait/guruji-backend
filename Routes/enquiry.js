import express from 'express';
import adminAuth from '../middleware/auth.js';
import {
    createEnquiry,
    getAllEnquiries,
    viewEnquiry,
    deleteEnquiry
} from '../controller/enquiryController.js';

const enquiryRouter = express.Router();

enquiryRouter.post('/enquiry', createEnquiry);
enquiryRouter.get('/enquiries', adminAuth, getAllEnquiries);
enquiryRouter.get('/enquiry/:id', adminAuth, viewEnquiry);
enquiryRouter.delete('/enquiry/delete/:id', adminAuth, deleteEnquiry);

export default enquiryRouter;