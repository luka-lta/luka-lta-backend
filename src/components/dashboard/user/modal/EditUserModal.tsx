'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {toast} from "sonner";

type User = {
    id: number
    name: string
    email: string
    role: string
}

type EditUserModalProps = {
    user?: User
    onClose: () => void
}

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [role, setRole] = useState(user?.role || 'User')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData()
        if (user) {
            formData.append('id', user.id.toString())
        }
        formData.append('name', name)
        formData.append('email', email)
        formData.append('role', role)

        if (user) {
            toast.success('User edited successfully')
        } else {
            // Add user
            toast.success('User added successfully')
        }
        onClose()
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="User">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit">{user ? 'Update' : 'Add'} User</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

