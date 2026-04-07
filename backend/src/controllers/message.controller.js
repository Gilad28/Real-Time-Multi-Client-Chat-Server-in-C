import Conversation from "../models/Groups.js";
import Message from "../models/Message.js";
import User from "../model/User.js"

/*
    Creates or fetches a 1-on-1 DM based on an email input.
    Expects: { "email": "target@example.com" }
*/
export const createDM = async (req, res) => {

}

/*
    Creates a Group Chat for up to 10 people based on an array of emails.
    Expects: { "emails": ["user1@ex.com", "user2@ex.com"], "groupName": "Study Group" }
    the group name by default is "Group Chat" This is stored in the schema
*/
export const createGroupChat = async (req, res) => {
    
}

/*
    Fetches all conversations, DMs and Groups, that the logged-in user is a part of.
    Used to populate the sidebar on the frontend.
*/
export const getConversations = async (req, res) => {
    
}

/*
    Sends a message to a specific conversation.
    Expects: text or image in req.body, conversationId in req.params
*/
export const sendMessage = async (req, res) => {
    
}

/*
    Gets all message for a unique chat or groupchat
*/
export const getMessages = async (req, res) => {
    
}