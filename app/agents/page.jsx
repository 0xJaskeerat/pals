"use client"

import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { FaPaperPlane, FaLightbulb, FaSpinner } from 'react-icons/fa'
import styles from '../page.module.css'

const Page = () => {
  const [mounted, setMounted] = useState(false);
  const [topic, setTopic] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true)
  },[])

  if(!mounted) return null

  const generateBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agents?topic=${encodeURIComponent(topic)}`);
      const data = await response.json();
      
      if (data.output) {
        setBlogs(prevBlogs => [...prevBlogs, data.output]);
      }
    } catch (error) {
      console.error('Error generating blog:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>AI Travel Blog Generator</h1>
        
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a travel destination or topic..."
            className={styles.input}
          />
          <button
            onClick={generateBlog}
            disabled={loading || !topic}
            className={styles.button}
          >
            {loading ? (
              <FaSpinner className={styles.spinner} />
            ) : (
              <FaPaperPlane />
            )}
            Generate
          </button>
        </div>

        <div className={styles.blogContainer}>
          {blogs.map((blog, index) => (
            <article key={index} className={styles.blogPost}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    root: ({ children }) => <div className={styles.markdown}>{children}</div>
                }}
              >
                {blog}
              </ReactMarkdown>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Page