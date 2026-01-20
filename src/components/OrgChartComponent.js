import { getAllUser2, getUserByReference } from '@/func/functions'
import { Box, CircularProgress } from '@mui/material'
import React, { useState, useEffect } from 'react'
import Tree from 'react-d3-tree'

const BinaryTreeView = ({ allDataView }) => {
  const [selectedUserId, setSelectedUserId] = useState(null)

  // Use state to manage the dynamic user data
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const fetchUserAndRedirect = async () => {
      const user =
        typeof window !== 'undefined'
          ? window.localStorage.getItem('earth_user')
          : false
      const parsedUser = user ? JSON.parse(user) : false

      if (parsedUser) {
        const singleUserData = await getUserByReference(parsedUser.myReference)
        if (allDataView) {
          setSelectedUserId('DR-261211')
        } else {
          setSelectedUserId(singleUserData.myReference)
        }
      } else {
        setSelectedUserId('DR-261211')
      }

      const data = await getAllUser2()
      setUserData(data)
    }

    fetchUserAndRedirect()
  }, [])

  if (!userData)
    return (
      <Box
        sx={{
          width: '90vw',
          height: '20vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )

  const findUserById = userId =>
    userData.find(user => user.myReference === userId)

  const generateTreeData = userId => {
    const user = findUserById(userId)

    if (!user) {
      return null
    }

    // Ensure the user has two children, either real children or blank nodes
    const childrenCount = user.children.length
    const blankNodesCount = Math.max(0, 2 - childrenCount)
    const children = [
      ...user.children.map(childId => generateTreeData(childId)),
      ...Array.from({ length: blankNodesCount }, (_, index) => ({
        myReference: `blank-${userId}-${index}`,
        name: 'Blank',
        avatarUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbHvZ2JK-oa1Hcq0hCVxF-PDwfMQY09ocJ3A&usqp=CAU', // Replace with a link to your blank profile picture
        children: [],
      })),
    ]

    const treeData = {
      myReference: user.myReference,
      name: user.name,
      avatarUrl: user.avatarUrl,
      children,
    }

    return treeData
  }

  const handleClick = (nodeData, evt) => {
    const userId = nodeData.myReference
    // setSelectedUserId(userId)
  }

  // Example: Function to simulate adding a new user
  const addUser = () => {
    const newUserId = userData.length + 1
    const newUser = {
      myReference: newUserId,
      name: `User ${newUserId}`,
      avatarUrl: 'https://picsum.photos/200',
      children: [], // Initially, the new user has no children
    }

    // Update the user data state
    setUserData(prevUserData => [...prevUserData, newUser])
  }

  // Example: Simulate adding a new user after a delay
  // Remove this in a real scenario and add users based on your registration logic
  setTimeout(addUser, 3000) // Add a new user after 3 seconds

  const treeData = generateTreeData(selectedUserId)

  return (
    <div style={{ width: '100%', height: '500px', zIndex: 200 }}>
      <Tree
        data={treeData}
        orientation="vertical"
        translate={{ x: 300, y: 150 }}
        separation={{ siblings: 2, nonSiblings: 3 }}
        onClick={handleClick}
        renderCustomNodeElement={rd3tProps =>
          renderNodeWithCustomEvents({ ...rd3tProps, handleClick })
        }
      />
    </div>
  )
}

export default BinaryTreeView

const renderNodeWithCustomEvents = ({ nodeDatum, toggleNode, handleClick }) => {
  const imageSize = 145
  const fontSize = 18

  return (
    <g>
      {nodeDatum.avatarUrl && (
        <defs>
          <clipPath id={`clip-${nodeDatum.myReference}`}>
            <circle cx="0" cy="0" r={45} />
          </clipPath>
        </defs>
      )}
      {nodeDatum.avatarUrl && (
        <image
          href={nodeDatum.avatarUrl}
          x={-imageSize / 2}
          y={-imageSize / 2}
          width={imageSize}
          height={imageSize}
          onClick={() => handleClick(nodeDatum)}
          className="node-image"
          clipPath={`url(#clip-${nodeDatum.myReference})`}
        />
      )}
      <text
        fill="black"
        strokeWidth="1"
        x="60"
        fontSize={fontSize}
      // onClick={toggleNode}
      >
        {nodeDatum.name}
      </text>
    </g>
  )
}
