import Conversation from "../models/Groups.js";
import Message from "../models/Message.js";
import User from "../model/User.js"

/*
    Creates or fetches a 1-on-1 DM based on an email input.
    Expects: { "email": "target@example.com" }
*/
export const createDM = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "email was undefined"});
        }

        const currentUserId = req.user._id;
        if (!currentUserId) {
            return res.status(400).json({ message: "UserId was undefined"});
        }

        // Used after email and Id are verified to find the user they want to message
        const targetUser = await User.findOne({ email });
        if (!targetUser) {
            return res.status(404).json({ message: "There is no user with that email"});
        }
        if (targetUser._id.toString() === currentUserId.toString()) {
            return res.status(400).json({ message: "You cannot DM yourself."});
        }

        // Check if a DM already exists between these two exact users
        // $all ensures both are in the array, $size ensures it's only these two to avoid group chats
        let conversation = await Conversation.findOne({
            isGroupChat: false,
            participants: { $all: [currentUserId, targetUser._id], $size: 2 }
        }).populate("participants", "-password"); // Populate grabs the user data without the password

        // If it doesn't exist, create it
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [currentUserId, targetUser._id],
                isGroupChat: false,
            });
            // Populate the newly created conversation
            conversation = await conversation.populate("participants", "-password");
        }

        res.status(200).json(conversation);

    } catch (error) {
        console.error("Internal Error in createDM: ", error);
        res.status(500).json({ message: "Internal server error"});
    }
}

/*
    Creates a Group Chat for up to 10 people based on an array of emails.
    Expects: { "emails": ["user1@ex.com", "user2@ex.com"], "groupName": "Study Group" }
    the group name by default is "Group Chat" This is stored in the schema
*/
export const createGroupChat = async (req, res) => {
    try {
        const { emails } = req.body;
        if (!emails || emails.length === 0) {
            return res.status(400).json({ message: "Please enter emails to create a group chat."});
        }

        const { groupname } = req.body;

        // set's the limit on how many people can be in a groupchat, for this multichatclient it's 10
        if ( emails.length > 9) {
            return res.status(400).json({ message: "Group chats are limited to 10 people. (9 others including you)"});
        }

        // converts the emails to the users
        const members = await User.find({ email: { $in: emails}});

        if (members.length !== emails.length) {
            return res.status(400).json({ message: "One or more emails entered is invalid"});
        }

        // Gets the objectIds and the creater Id
        const groupchatMemberIds = members.map( user => user._id);
        groupchatMemberIds.push(req.user._id);

        const newGroup = await Conversation.create({
            participants: groupchatMemberIds,
            isGroupChat: true,
            groupName: groupname || "Group Chat"
        });

        const fullGroup = await newGroup.populate("participants", "-password");
        res.status(201).json(fullGroup);
    } catch ( error ) {
        console.error("Internal Error in createGroupChat: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/*
    Fetches all conversations, DMs and Groups, that the logged-in user is a part of.
    Used to populate the sidebar on the frontend.
*/
export const getConversations = async (req, res) => {
        try {

    } catch ( error ) {
        console.error("Internal Error in getConversations: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/*
    Sends a message to a specific conversation.
    Expects: text or image in req.body, conversationId in req.params
*/
export const sendMessage = async (req, res) => {
        try {

    } catch ( error ) {
        console.error("Internal Error in sendMessage: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

/*
    Gets all message for a unique chat or groupchat
*/
export const getMessages = async (req, res) => {
        try {

    } catch ( error ) {
        console.error("Internal Error in getMessages: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
}