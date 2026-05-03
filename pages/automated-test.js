import React, { useState } from 'react'
import { Container, Button, Typography, Box, Paper } from '@mui/material'
import { db } from '../config/firebase.init'
import {
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    updateDoc
} from 'firebase/firestore'
import {
    addUser,
    updateUser,
    checkAndPayMatchingBonus,
    moneyAddRemove,
    createTransaction,
    getUserByReference,
    getMonthlyBonusCandidates,
    payMonthlyBonus
} from '@/func/functions'

const AutomatedTest = () => {
    const [logs, setLogs] = useState([])
    const [isRunning, setIsRunning] = useState(false)

    const addLog = (msg) => setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`])

    const clearDB = async () => {
        addLog('Clearing database (user, transactions, monthlyBonuses)...')
        const collections = ['user', 'transactions', 'monthlyBonuses']
        for (const colName of collections) {
            const snap = await getDocs(collection(db, colName))
            for (const d of snap.docs) {
                await deleteDoc(doc(db, colName, d.id))
            }
        }
        addLog('Database cleared.')
    }

    const createMember = async (name, refId, placeUnderId, joiningDate) => {
        const myRef = `${name}-${Math.floor(Math.random() * 1000)}`
        const data = {
            name: name,
            myReference: myRef,
            referenceId: refId,
            placeUnder: placeUnderId,
            balance: 5000,
            children: [],
            role: 'member',
            mobileNumber: `01${Math.floor(Math.random() * 1000000000)}`,
            password: 'password123',
            joiningDate: joiningDate || new Date().toISOString()
        }

        await addUser(data)
        if (placeUnderId) {
            await updateUser(placeUnderId, myRef)
        }

        // Simulate logic from add-member.js
        if (refId) await moneyAddRemove(refId, 500, true) // Referral Bonus
        await checkAndPayMatchingBonus(myRef, placeUnderId) // Matching Bonus & Rank

        return myRef
    }

    const runTests = async () => {
        setIsRunning(true)
        setLogs([])
        try {
            await clearDB()
            const adminId = 'RAKIB'
            addLog('Creating Admin User...')
            await addUser({
                name: 'System Admin',
                myReference: adminId,
                referenceId: '',
                placeUnder: '',
                balance: 0,
                children: [],
                role: 'admin',
                mobileNumber: '01000000000',
                password: 'admin',
                joiningDate: '2024-01-01'
            })

            // SCENARIO 1: Achieve Rank in Month 1 (May 2024)
            const month1 = '2024-05'
            addLog(`--- Month 1: Building Tree for Rank (Target: 20/20) ---`)

            // Build Left Side (20 users)
            let lastLeft = adminId
            for (let i = 1; i <= 20; i++) {
                lastLeft = await createMember(`L${i}`, adminId, lastLeft, `${month1}-01`)
            }
            addLog('20 Users added to Left.')

            // Build Right Side (20 users)
            let lastRight = adminId
            for (let i = 1; i <= 20; i++) {
                lastRight = await createMember(`R${i}`, adminId, lastRight, `${month1}-01`)
            }
            addLog('20 Users added to Right.')

            // Verify Rank
            const adminData = await getUserByReference(adminId)
            addLog(`Admin Matches: ${adminData.paidMatches}, Rank: ${adminData.rank}`)
            if (adminData.rank === 'Marketing Associate') {
                addLog('✅ SUCCESS: Rank Promoted to Marketing Associate!')
            } else {
                addLog('❌ FAILURE: Rank not promoted.')
            }

            // SCENARIO 2: Imbalance & Monthly Bonus in Month 2 (June 2024)
            const month2 = '2024-06'
            addLog(`--- Month 2: Imbalance & Monthly Bonus Test ---`)

            // Add extra 10 users to Right to create imbalance (Total R = 30, L = 20)
            for (let i = 21; i <= 30; i++) {
                lastRight = await createMember(`R${i}`, adminId, lastRight, `${month2}-01`)
            }
            addLog('Added 10 extra users to Right. Current State: L=20, R=30.')

            // Add 15 users to Left to match the imbalance (Total L = 35, R = 30)
            // This should create 10 new matches (making total matches 30)
            for (let i = 21; i <= 35; i++) {
                lastLeft = await createMember(`L${i}`, adminId, lastLeft, `${month2}-05`)
            }
            addLog('Added 15 users to Left. Current State: L=35, R=30. New matches: 10.')

            addLog('Checking Monthly Bonus Candidates for June...')
            const candidates = await getMonthlyBonusCandidates(month2)
            const isEligible = candidates.find(c => c.userId === adminId)

            if (isEligible) {
                addLog(`❌ FAILURE: User eligible with only 10 matches. (Logic Error)`)
            } else {
                addLog(`✅ SUCCESS: User NOT eligible with 10 matches.`)
            }

            // Now add 5 more users to Right to reach 15 new matches for this month
            for (let i = 31; i <= 35; i++) {
                lastRight = await createMember(`R${i}`, adminId, lastRight, `${month2}-10`)
            }
            addLog('Added 5 more to Right. Current State: L=35, R=35. Total Matches: 35. Monthly New Matches: 15.')

            const candidatesFinal = await getMonthlyBonusCandidates(month2)
            const isEligibleFinal = candidatesFinal.find(c => c.userId === adminId)

            if (isEligibleFinal) {
                addLog(`✅ SUCCESS: User is now Eligible for Monthly Bonus (15 new matches)!`)
                // Test paying the bonus
                await payMonthlyBonus(adminId, month2)
                addLog(`Paid 5000 Monthly Bonus to Admin.`)
            } else {
                addLog(`❌ FAILURE: User not eligible even with 15 matches.`)
            }

            addLog('--- All Tests Completed! ---')

        } catch (error) {
            addLog(`CRITICAL ERROR: ${error.message}`)
            console.error(error)
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
            <Typography variant="h4" gutterBottom>Comprehensive System Test</Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="body1" color="error" sx={{ mb: 2 }}>
                    WARNING: This will CLEAR the current database ({db.app.options.projectId}).
                    Use ONLY for testing.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={runTests}
                    disabled={isRunning}
                    fullWidth
                >
                    {isRunning ? 'Running Tests...' : 'Run All Scenarios'}
                </Button>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: '#1e1e1e', color: '#00ff00', minHeight: '400px', overflow: 'auto' }}>
                <Typography variant="subtitle2" sx={{ borderBottom: '1px solid #333', pb: 1, mb: 1 }}>Logs:</Typography>
                {logs.map((log, i) => (
                    <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '4px' }}>{log}</div>
                ))}
            </Paper>
        </Container>
    )
}

export default AutomatedTest
