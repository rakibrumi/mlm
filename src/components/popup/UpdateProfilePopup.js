import React, { useState, useEffect, useCallback } from 'react'
import ClearIcon from '@mui/icons-material/Clear'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { Button, TextField, Typography, Box, IconButton, InputAdornment } from '@mui/material'
import { ButtonAnimate } from '../animate'
import { updateUserProfile } from '@/func/functions'
import toast from 'react-hot-toast'
import UploadAvatar from '@/components/@material-extend/UploadAvatar'
import fileUploader from '@/utils/fileUploader'

const UpdateProfilePopup = ({ open, setOpen, currentUser }) => {
    const [input, setInput] = useState({
        name: '',
        mobileNumber: '',
        myReference: '',
        avatarUrl: '',
        dob: '',
        father_name: '',
        mother_name: '',
        presentAddress: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)
    const [uploadLoading, setUploadLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        if (currentUser) {
            setInput({
                name: currentUser.name || '',
                mobileNumber: currentUser.mobileNumber || '',
                myReference: currentUser.myReference || '',
                avatarUrl: currentUser.avatarUrl || '',
                dob: currentUser.dob || '',
                father_name: currentUser.father_name || '',
                mother_name: currentUser.mother_name || '',
                presentAddress: currentUser.presentAddress || '',
                password: currentUser.password || '',
            })
        }
    }, [currentUser])

    const handleChange = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }

    const handleDrop = useCallback(async acceptedFiles => {
        const file = acceptedFiles[0]
        if (file) {
            setUploadLoading(true)
            try {
                const url = await fileUploader(file)
                if (url) {
                    setInput(prev => ({
                        ...prev,
                        avatarUrl: url,
                    }))
                    toast.success('Image uploaded successfully')
                } else {
                    toast.error('Image upload failed')
                }
            } catch (error) {
                toast.error('Error uploading image')
                console.error(error)
            } finally {
                setUploadLoading(false)
            }
        }
    }, [])

    const handleUpdate = async () => {
        if (!input.name || !input.mobileNumber) {
            return toast.error('Name and Mobile Number are required')
        }

        setLoading(true)
        const result = await updateUserProfile(currentUser.myReference, {
            name: input.name,
            mobileNumber: input.mobileNumber,
            avatarUrl: input.avatarUrl,
            dob: input.dob,
            father_name: input.father_name,
            mother_name: input.mother_name,
            presentAddress: input.presentAddress,
            password: input.password,
        })

        if (result && result.success) {
            toast.success('Profile updated successfully')

            // Update local storage to reflect changes immediately
            const storedUser = JSON.parse(localStorage.getItem('earth_user'))
            if (storedUser) {
                const updatedUser = {
                    ...storedUser,
                    name: input.name,
                    mobileNumber: input.mobileNumber,
                    avatarUrl: input.avatarUrl,
                    dob: input.dob,
                    father_name: input.father_name,
                    mother_name: input.mother_name,
                    presentAddress: input.presentAddress,
                    password: input.password
                }
                localStorage.setItem('earth_user', JSON.stringify(updatedUser))
            }

            setOpen(false)
            window.location.reload()
        } else {
            toast.error(result?.error || 'Failed to update profile')
        }
        setLoading(false)
    }

    if (!open) return null

    return (
        <div className="popup_wrapper">
            <div className="popup_content relative" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                <ClearIcon
                    onClick={() => setOpen(false)}
                    className="absolute right-0 top-0 mr-4 mt-4 h-4 w-4 cursor-pointer"
                    style={{ zIndex: 10 }}
                />
                <div className="mt-4">
                    <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
                        Update Profile
                    </Typography>

                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <UploadAvatar
                            accept="image/*"
                            file={input.avatarUrl}
                            onDrop={handleDrop}
                            caption={
                                <Typography
                                    variant="caption"
                                    sx={{
                                        mt: 2,
                                        mx: 'auto',
                                        display: 'block',
                                        textAlign: 'center',
                                        color: 'text.secondary',
                                    }}
                                >
                                    Allowed *.jpeg, *.jpg, *.png, *.gif
                                    <br /> max size of 3.1 MB
                                </Typography>
                            }
                        />
                    </Box>
                    {uploadLoading && <Typography align="center" variant="body2" sx={{ mb: 2 }}>Uploading...</Typography>}

                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={input.name}
                        onChange={handleChange}
                        variant="outlined"
                        disabled
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Mobile Number"
                        name="mobileNumber"
                        value={input.mobileNumber}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={input.password}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ mb: 2 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={() => setShowPassword(!showPassword)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={input.dob}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Father's Name"
                        name="father_name"
                        value={input.father_name}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Mother's Name"
                        name="mother_name"
                        value={input.mother_name}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Present Address"
                        name="presentAddress"
                        value={input.presentAddress}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ mb: 2 }}
                        multiline
                        rows={2}
                    />

                    <TextField
                        fullWidth
                        label="Reference ID"
                        value={input.myReference}
                        disabled
                        variant="filled"
                        sx={{ mb: 2 }}
                        helperText="Reference ID cannot be changed"
                    />

                    <ButtonAnimate>
                        <Button
                            onClick={handleUpdate}
                            fullWidth
                            size="large"
                            variant="contained"
                            disabled={loading || uploadLoading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </Button>
                    </ButtonAnimate>
                </div>
            </div>
        </div>
    )
}

export default UpdateProfilePopup
