import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "🌟Astral-Blog",
  description: "A HDUer's blog with corroding passion",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'CTF', link: '/Notes/CTF' },
      { text: 'STM32', link: '/Notes/STM32' },
      { text: 'Linux', link: '/Notes/Linux' },
      { text: 'Web', link: '/Notes/Web' },
      { text: 'Python', link: '/Notes/Python' },
      { text: 'C', link: '/Notes/C' }
    ],

    sidebar: [
      {
        text: 'Study Notes',
        items: [
          { text: 'CTF', link: '/Notes/CTF' },
          { text: 'STM32', link: '/Notes/STM32' },
          { text: 'Linux', link: '/Notes/Linux' },
          { text: 'Web', link: '/Notes/Web' },
          { text: 'Python', link: '/Notes/Python' },
          { text: 'C', link: '/Notes/C' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Marastraluster' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/453797318?spm_id_from=333.1007.0.0' }
    ]
  }
})
