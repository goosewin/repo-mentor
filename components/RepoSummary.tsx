import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const RepoSummary: React.FC = () => {
  return (
    <>
      <CardHeader>
        <CardTitle>Repository Summary</CardTitle>
        <CardDescription>Overview of the loaded repository</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>React</Badge>
              <Badge>TypeScript</Badge>
              <Badge>Next.js</Badge>
              <Badge>Tailwind CSS</Badge>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">README Summary</h3>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              This project is a modern web application built with React and Next.js. 
              It demonstrates best practices for building scalable and maintainable front-end applications.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Project Structure</h3>
            <ul className="list-disc list-inside text-sm text-gray-800 dark:text-gray-200">
              <li>src/: Contains all source code</li>
              <li>src/components/: Reusable React components</li>
              <li>src/pages/: Next.js pages and API routes</li>
              <li>src/styles/: Global styles and Tailwind config</li>
              <li>public/: Static assets</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </>
  )
}

