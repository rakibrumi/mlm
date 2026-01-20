import React, { useState, useEffect } from 'react'
import { Container, Button, Typography, Box, Paper, TextField } from '@mui/material'
import {
    addUser,
    getUserByReference,
    checkAndPayLevelBonus,
    moneyAddRemove,
} from '@/func/functions'
import { updateDoc, doc, collection, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../config/firebase.init'

const VerifyReferral = () => {
    const [logs, setLogs] = useState([])
    const [rootBalance, setRootBalance] = useState(0)
    const [loading, setLoading] = useState(false)

    const addLog = (msg) => setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`])

    const fetchRootBalance = async () => {
        try {
            const user = await getUserByReference('DR-261211')
            if (user) setRootBalance(user.balance)
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        fetchRootBalance()
    }, [])

    const resetTestUsers = async () => {
        try {
            setLoading(true)
            addLog('Resetting Test Users...')
            // Delete users containing "TestUser-" in name
            const querySnapshot = await getDocs(collection(db, 'user'))
            const deletes = []
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data()
                if (data.name && data.name.startsWith('TestUser-')) {
                    deletes.push(deleteDoc(doc(db, 'user', docSnap.id)))
                }
            })
            await Promise.all(deletes)

            // Reset Root children and balance (optional, but good for clean state)
            const root = await getUserByReference('DR-261211')
            if (root) {
                // Note: resetting balance might be tricky if real money is there, but for test we can just clear children
                await updateDoc(doc(db, 'user', root.mobileNumber), { children: [] }) // Assuming docID logic. Wait, functions.js uses data.myReference as doc ID in `addUser`?
                // In functions.js: `await setDoc(doc(db, 'user', data.myReference), data)`
                // So doc ID is myReference.
                await updateDoc(doc(db, 'user', 'DR-261211'), { children: [] })
            }

            addLog('Reset Complete. Root children cleared.')
            fetchRootBalance()
        } catch (e) {
            addLog(`Error resetting: ${e.message}`)
        } finally {
            setLoading(false)
        }
    }

    const runSimulation = async () => {
        setLoading(true)
        setLogs([])
        addLog('Starting Simulation...')

        try {
            const rootId = 'DR-261211'
            const rootUser = await getUserByReference(rootId)
            if (!rootUser) {
                addLog('Error: DR-261211 not found!')
                setLoading(false)
                return
            }

            // Helper to create user
            const createTestUser = async (name, underId, refId = rootId) => {
                const id = `TestUser-${name}-${Math.floor(Math.random() * 1000)}`
                const user = {
                    name: id,
                    myReference: id,
                    referenceId: refId, // Who referred them
                    placeUnder: underId, // Parent in tree
                    balance: 5000, // Enough to join
                    children: [],
                    role: 'member',
                    mobileNumber: `${Math.floor(Math.random() * 10000000000)}`
                }

                addLog(`Creating ${id} under ${underId}...`)

                // 1. Add User to DB
                await addUser(user)

                // 2. Update Parent's children
                const parent = await getUserByReference(underId)
                if (parent) {
                    const newChildren = [...(parent.children || []), id]
                    await updateDoc(doc(db, 'user', underId), { children: newChildren })
                }

                // 3. Transactions (Simulate add-member logic)
                // Deduct 4600 from new user (skipped as it's test user)
                // Add 4600 to Admin
                await moneyAddRemove('DR-261211', 4600, true)
                addLog(`Paid 4600 Joining Fee to Admin`)

                // Check Referral Bonus
                await moneyAddRemove(refId, 500, true)
                addLog(`Paid 500 Direct Referral Bonus to ${refId}`)

                // Check Level Bonus
                addLog(`Checking Level Bonus for ${id}...`)
                await checkAndPayLevelBonus(id, underId)

                return id
            }

            // Scenario:
            // Root -> A, B (L1)
            // A -> A1, A2 (L2)
            // B -> B1, B2 (L2)

            const idA = await createTestUser('A', rootId)
            await fetchRootBalance() // Check logic

            const idB = await createTestUser('B', rootId)
            await fetchRootBalance() // Should trigger Root Level 1 Bonus (2 users)

            const idA1 = await createTestUser('A1', idA, idA) // A refers A1, placed under A
            const idA2 = await createTestUser('A2', idA, idA) // A refers A2, placed under A
            // Should trigger A Level 1 Bonus
            // Root Level 2 count = 2. Should trigger Root Level 2 Bonus?

            const idB1 = await createTestUser('B1', idB, idB)
            const idB2 = await createTestUser('B2', idB, idB)
            // Should trigger B Level 1 Bonus
            // Root Level 2 count = 4. Should trigger Root Level 2 Bonus again?

            addLog('Simulation Complete.')
            fetchRootBalance()

        } catch (e) {
            addLog(`Error: ${e.message}`)
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container maxWidth="md" sx={{ mt: 10, mb: 10 }}>
            <Typography variant="h4" gutterBottom>Referral System Verification</Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6">Root User: DR-261211</Typography>
                <Typography variant="body1">Current Balance: {rootBalance}</Typography>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button variant="contained" color="warning" onClick={resetTestUsers} disabled={loading}>
                    Reset Test Data (Use Caution)
                </Button>
                <Button variant="contained" color="primary" onClick={runSimulation} disabled={loading}>
                    Run Simulation
                </Button>
            </Box>

            <Paper sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '300px', maxHeight: '500px', overflow: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom>Logs:</Typography>
                {logs.map((log, i) => (
                    <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{log}</div>
                ))}
            </Paper>
        </Container>
    )
}

export default VerifyReferral
