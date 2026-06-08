import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import Session from '../models/Session.js'

// initialize Gemini model once — reused for all requests
const model = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.7  // 0 = very precise, 1 = more creative
})

// builds conversation history from saved messages
// LangChain needs messages in its own format — not plain objects
const buildChatHistory = (messages) => {
    return messages.map(msg => {
        if (msg.role === 'user') {
            return new HumanMessage(msg.content)
        } else {
            return new AIMessage(msg.content)
        }
    })
}

// POST /api/interview/chat
export const chat = async (req, res, next) => {
    try {
        const { message, topic, difficulty, sessionId } = req.body
        const userId = req.user.userId  // from auth middleware

        let session

        if (sessionId) {
            // existing session — load from DB
            session = await Session.findOne({ _id: sessionId, userId })
            if (!session) {
                return res.status(404).json({ error: 'Session not found' })
            }
        } else {
            // new session — create it
            session = await Session.create({
                userId,
                topic,
                difficulty,
                messages: []
            })
        }

        // rebuild conversation history from saved messages
        const chatHistory = buildChatHistory(session.messages)

        // the prompt that makes Gemini behave like an interviewer
        const systemPrompt = new SystemMessage(`
          You are a strict but fair technical interviewer at a top tech company.
          Topic: ${topic || session.topic}
          Difficulty: ${difficulty || session.difficulty}
          
          Rules:
          - Ask one question at a time
          - Evaluate the candidate's answer before asking next question
          - Give a score out of 10 for each answer
          - Be encouraging but honest
          - If this is the first message, introduce yourself briefly and ask first question
        `)

        // run the model — send system prompt, history, and new message
        const messages = [
            systemPrompt,
            ...chatHistory,
            new HumanMessage(message)
        ]

        const response = await model.invoke(messages)
        const aiReply = response.content

        // save both messages to session in MongoDB
        session.messages.push({ role: 'user', content: message })
        session.messages.push({ role: 'ai', content: aiReply })
        await session.save()

        res.json({
            reply: aiReply,
            sessionId: session._id  // send back so React can use it next time
        })

    } catch (err) {
        next(err)
    }
}

// GET /api/interview/sessions
// get all sessions for logged in user
export const getSessions = async (req, res, next) => {
    try {
        const sessions = await Session.find({ userId: req.user.userId })
            .select('-messages')  // exclude messages — too heavy for a list
            .sort({ createdAt: -1 })  // newest first

        res.json({ sessions })
    } catch (err) {
        next(err)
    }
}

// GET /api/interview/sessions/:id
// get one full session with all messages
export const getSession = async (req, res, next) => {
    try {
        const session = await Session.findOne({
            _id: req.params.id,
            userId: req.user.userId  // security — users can only see their own sessions
        })

        if (!session) {
            return res.status(404).json({ error: 'Session not found' })
        }

        res.json({ session })
    } catch (err) {
        next(err)
    }
}