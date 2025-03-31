// src/app/obm-admin/dashboard/page.tsx
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
  } from "@/components/ui/card";
  import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from "@/components/ui/tabs";
  import { Button } from "@/components/ui/button";
  import { Progress } from "@/components/ui/progress";
  import { 
    ArrowRight, 
    Book, 
    CheckCircle, 
    ClipboardList,
    FileText, 
    Timer, 
    TrendingUp,
    MessageSquare
  } from "lucide-react";
  import Link from "next/link";
  
  export default function DashboardPage() {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <Button>View All Analytics</Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Tests Attempted
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +8 from last week
              </p>
              <Progress value={60} className="h-1 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Time Studied
              </CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28h 14m</div>
              <p className="text-xs text-muted-foreground">
                +4h from last week
              </p>
              <Progress value={70} className="h-1 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                +2% from last week
              </p>
              <Progress value={87} className="h-1 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">74%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last week
              </p>
              <Progress value={74} className="h-1 mt-2" />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Subscribed Aircraft</CardTitle>
              <CardDescription>
                Your progress across different aircraft types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="boeing" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="boeing">Boeing 737 Max</TabsTrigger>
                  <TabsTrigger value="airbus">Airbus A320</TabsTrigger>
                </TabsList>
                <TabsContent value="boeing" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Systems</span>
                      </div>
                      <span className="text-sm text-muted-foreground">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Procedures</span>
                      </div>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Navigation</span>
                      </div>
                      <span className="text-sm text-muted-foreground">52%</span>
                    </div>
                    <Progress value={52} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Emergency Procedures</span>
                      </div>
                      <span className="text-sm text-muted-foreground">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    <Link href="/dashboard/mock-tests/boeing-737-max" className="flex w-full items-center justify-center">
                      View All Boeing 737 Max Tests
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </TabsContent>
                
                <TabsContent value="airbus" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Systems</span>
                      </div>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Procedures</span>
                      </div>
                      <span className="text-sm text-muted-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Navigation</span>
                      </div>
                      <span className="text-sm text-muted-foreground">62%</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Emergency Procedures</span>
                      </div>
                      <span className="text-sm text-muted-foreground">81%</span>
                    </div>
                    <Progress value={81} className="h-2" />
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    <Link href="/dashboard/mock-tests/airbus-a320" className="flex w-full items-center justify-center">
                      View All Airbus A320 Tests
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>
                Continue where you left off
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start text-left">
                <ClipboardList className="mr-2 h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span>Boeing 737 Max - Systems Mock Test</span>
                  <span className="text-xs text-muted-foreground">In Progress (45% completed)</span>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-left">
                <FileText className="mr-2 h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span>Airbus A320 - Study Material</span>
                  <span className="text-xs text-muted-foreground">Last viewed 2 days ago</span>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-left">
                <ClipboardList className="mr-2 h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span>Airbus A320 - Procedures Practice Test</span>
                  <span className="text-xs text-muted-foreground">Not started</span>
                </div>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
              
              <div className="pt-4">
                <h3 className="mb-3 text-sm font-medium">Recent Community Discussions</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 border-b pb-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Link href="#" className="text-sm font-medium hover:underline">Tips for Boeing 737 Max systems exam</Link>
                      <p className="text-xs text-muted-foreground">15 comments • 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Link href="#" className="text-sm font-medium hover:underline">Study group for Airbus A320 procedures</Link>
                      <p className="text-xs text-muted-foreground">8 comments • 4 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>
                Your performance in recent tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">Boeing 737 Max - Navigation</p>
                    <p className="text-sm text-muted-foreground">Mock Test</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">78%</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">Pass</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">Airbus A320 - Systems</p>
                    <p className="text-sm text-muted-foreground">Practice Test</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">65%</span>
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Review</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Boeing 737 Max - Emergency</p>
                    <p className="text-sm text-muted-foreground">Practice Test</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">82%</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">Pass</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>
                Your current subscription details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex justify-between">
                    <h4 className="font-semibold">Boeing 737 Max</h4>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Expires on June 30, 2025</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Features:</span> Mock Tests, Practice Tests, Study Materials
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <div className="flex justify-between">
                    <h4 className="font-semibold">Airbus A320</h4>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Expires on June 30, 2025</p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Features:</span> Mock Tests, Practice Tests, Study Materials
                  </div>
                </div>
                
                <Button className="w-full">
                  <Link href="/dashboard/subscriptions" className="flex w-full items-center justify-center">
                    Manage Subscriptions
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }