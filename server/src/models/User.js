import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6
        }
    },
    {
        timestamps: true // auto adds createdAt and updatedAt
    }
)

// runs automatically BEFORE saving to MongoDB
// this is called a pre-save hook
userSchema.pre('save', async function () {
    // only hash if password was changed or is new
    if (!this.isModified('password')) return

    // bcrypt turns "mypassword123" into "$2a$10$xyz..."
    // 10 is the salt rounds — higher = more secure but slower
    this.password = await bcrypt.hash(this.password, 10)
})

// method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User