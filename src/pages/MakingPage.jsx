import { useState } from 'react'
import SectionHeader from '../components/shared/SectionHeader'
import usePageTitle from '../lib/usePageTitle'
import TabBar from '../components/shared/TabBar'
import ToolCard from '../components/making/ToolCard'
import FurnitureCard from '../components/making/FurnitureCard'
import tools from '../data/tools.json'
import design from '../data/design.json'

const tabs = [
  { id: 'software', label: 'Software Tools' },
  { id: 'design', label: 'Design' },
]

export default function MakingPage() {
  usePageTitle('Making')
  const [tab, setTab] = useState('software')

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <SectionHeader
        label="Making"
        title="Code & Design"
        description="Software tools and design projects. Two different practices, same impulse: make something useful out of what you have."
      />

      <div className="mb-8">
        <TabBar tabs={tabs} active={tab} onChange={setTab} />
      </div>

      {tab === 'software' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      )}

      {tab === 'design' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {design.map(item => <FurnitureCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}
