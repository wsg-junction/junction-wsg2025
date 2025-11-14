import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { XAxis, CartesianGrid, AreaChart, Area } from "recharts";
import {
  DollarSign,
  Users,
  ShoppingCart,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";

const chartData = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  { date: "2024-04-04", desktop: 242, mobile: 260 },
  { date: "2024-04-05", desktop: 373, mobile: 290 },
  { date: "2024-04-06", desktop: 301, mobile: 340 },
  { date: "2024-04-07", desktop: 245, mobile: 180 },
  { date: "2024-04-08", desktop: 409, mobile: 320 },
  { date: "2024-04-09", desktop: 59, mobile: 110 },
  { date: "2024-04-10", desktop: 261, mobile: 190 },
  { date: "2024-04-11", desktop: 327, mobile: 350 },
  { date: "2024-04-12", desktop: 292, mobile: 210 },
  { date: "2024-04-13", desktop: 342, mobile: 380 },
  { date: "2024-04-14", desktop: 137, mobile: 220 },
  { date: "2024-04-15", desktop: 120, mobile: 170 },
  { date: "2024-04-16", desktop: 138, mobile: 190 },
  { date: "2024-04-17", desktop: 446, mobile: 360 },
  { date: "2024-04-18", desktop: 364, mobile: 410 },
  { date: "2024-04-19", desktop: 243, mobile: 180 },
  { date: "2024-04-20", desktop: 89, mobile: 150 },
  { date: "2024-04-21", desktop: 137, mobile: 200 },
  { date: "2024-04-22", desktop: 224, mobile: 170 },
  { date: "2024-04-23", desktop: 138, mobile: 230 },
  { date: "2024-04-24", desktop: 387, mobile: 290 },
  { date: "2024-04-25", desktop: 215, mobile: 250 },
  { date: "2024-04-26", desktop: 75, mobile: 130 },
  { date: "2024-04-27", desktop: 383, mobile: 420 },
  { date: "2024-04-28", desktop: 122, mobile: 180 },
  { date: "2024-04-29", desktop: 315, mobile: 240 },
  { date: "2024-04-30", desktop: 454, mobile: 380 },
  { date: "2024-05-01", desktop: 165, mobile: 220 },
  { date: "2024-05-02", desktop: 293, mobile: 310 },
  { date: "2024-05-03", desktop: 247, mobile: 190 },
  { date: "2024-05-04", desktop: 385, mobile: 420 },
  { date: "2024-05-05", desktop: 481, mobile: 390 },
  { date: "2024-05-06", desktop: 498, mobile: 520 },
  { date: "2024-05-07", desktop: 388, mobile: 300 },
  { date: "2024-05-08", desktop: 149, mobile: 210 },
  { date: "2024-05-09", desktop: 227, mobile: 180 },
  { date: "2024-05-10", desktop: 293, mobile: 330 },
  { date: "2024-05-11", desktop: 335, mobile: 270 },
  { date: "2024-05-12", desktop: 197, mobile: 240 },
  { date: "2024-05-13", desktop: 197, mobile: 160 },
  { date: "2024-05-14", desktop: 448, mobile: 490 },
  { date: "2024-05-15", desktop: 473, mobile: 380 },
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
  { date: "2024-05-24", desktop: 294, mobile: 220 },
  { date: "2024-05-25", desktop: 201, mobile: 250 },
  { date: "2024-05-26", desktop: 213, mobile: 170 },
  { date: "2024-05-27", desktop: 420, mobile: 460 },
  { date: "2024-05-28", desktop: 233, mobile: 190 },
  { date: "2024-05-29", desktop: 78, mobile: 130 },
  { date: "2024-05-30", desktop: 340, mobile: 280 },
  { date: "2024-05-31", desktop: 178, mobile: 230 },
  { date: "2024-06-01", desktop: 178, mobile: 200 },
  { date: "2024-06-02", desktop: 470, mobile: 410 },
  { date: "2024-06-03", desktop: 103, mobile: 160 },
  { date: "2024-06-04", desktop: 439, mobile: 380 },
  { date: "2024-06-05", desktop: 88, mobile: 140 },
  { date: "2024-06-06", desktop: 294, mobile: 250 },
  { date: "2024-06-07", desktop: 323, mobile: 370 },
  { date: "2024-06-08", desktop: 385, mobile: 320 },
  { date: "2024-06-09", desktop: 438, mobile: 480 },
  { date: "2024-06-10", desktop: 155, mobile: 200 },
  { date: "2024-06-11", desktop: 92, mobile: 150 },
  { date: "2024-06-12", desktop: 492, mobile: 420 },
  { date: "2024-06-13", desktop: 81, mobile: 130 },
  { date: "2024-06-14", desktop: 426, mobile: 380 },
  { date: "2024-06-15", desktop: 307, mobile: 350 },
  { date: "2024-06-16", desktop: 371, mobile: 310 },
  { date: "2024-06-17", desktop: 475, mobile: 520 },
  { date: "2024-06-18", desktop: 107, mobile: 170 },
  { date: "2024-06-19", desktop: 341, mobile: 290 },
  { date: "2024-06-20", desktop: 408, mobile: 450 },
  { date: "2024-06-21", desktop: 169, mobile: 210 },
  { date: "2024-06-22", desktop: 317, mobile: 270 },
  { date: "2024-06-23", desktop: 480, mobile: 530 },
  { date: "2024-06-24", desktop: 132, mobile: 180 },
  { date: "2024-06-25", desktop: 141, mobile: 190 },
  { date: "2024-06-26", desktop: 434, mobile: 380 },
  { date: "2024-06-27", desktop: 448, mobile: 490 },
  { date: "2024-06-28", desktop: 149, mobile: 200 },
  { date: "2024-06-29", desktop: 103, mobile: 160 },
  { date: "2024-06-30", desktop: 446, mobile: 400 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;
const transactions = [
  {
    id: "TRX-0012",
    user: "Ava Martin",
    avatar: "/avatars/1.jpg",
    date: "2025-11-01",
    amount: 240.0,
    status: "Completed",
  },
  {
    id: "TRX-0013",
    user: "Liam Smith",
    avatar: "/avatars/2.jpg",
    date: "2025-11-02",
    amount: 1299.0,
    status: "Processing",
  },
  {
    id: "TRX-0014",
    user: "Noah Brown",
    avatar: "/avatars/3.jpg",
    date: "2025-11-03",
    amount: 49.99,
    status: "Failed",
  },
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("90d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      Hello World, welcome to the Dashboard!
      {/* Top summary KPI cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <DollarSign className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-sm">Revenue</CardTitle>
                  <CardDescription className="text-xs">
                    This month
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">$41,000</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowUpRight className="size-3 text-green-500" /> 12.4%
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-secondary/10 p-2 text-secondary">
                  <Users className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-sm">Customers</CardTitle>
                  <CardDescription className="text-xs">
                    Active this month
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">8,412</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowUpRight className="size-3 text-green-500" /> 3.2%
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                  <ShoppingCart className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-sm">Orders</CardTitle>
                  <CardDescription className="text-xs">
                    Open & in progress
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">128</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowDownRight className="size-3 text-rose-500" /> 1.8%
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="p-4">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted/10 p-2 text-muted-foreground">
                  <Clock className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-sm">Avg. Response</CardTitle>
                  <CardDescription className="text-xs">
                    Support team
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">1h 12m</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="size-3" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Main content: chart + recent transactions */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Year to date</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                      className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
                      aria-label="Select a value"
                    >
                      <SelectValue placeholder="Last 3 months" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="90d" className="rounded-lg">
                        Last 3 months
                      </SelectItem>
                      <SelectItem value="30d" className="rounded-lg">
                        Last 30 days
                      </SelectItem>
                      <SelectItem value="7d" className="rounded-lg">
                        Last 7 days
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm">Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient
                      id="fillDesktop"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-desktop)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-desktop)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-mobile)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-mobile)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }}
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    dataKey="mobile"
                    type="natural"
                    fill="url(#fillMobile)"
                    stroke="var(--color-mobile)"
                    stackId="a"
                  />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="url(#fillDesktop)"
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
            <CardFooter>
              <div className="flex flex-1 items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Compared to last year
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">+18.6%</div>
                  <div className="text-xs text-muted-foreground">
                    Revenue growth
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common operations</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/avatars/4.jpg" alt="Team" />
                      <AvatarFallback>TM</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Team Alpha</div>
                      <div className="text-xs text-muted-foreground">
                        6 members
                      </div>
                    </div>
                  </div>
                  <div className="w-24">
                    <Progress value={60} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="/avatars/5.jpg" alt="Campaign" />
                      <AvatarFallback>CP</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Campaign B</div>
                      <div className="text-xs text-muted-foreground">
                        Running
                      </div>
                    </div>
                  </div>
                  <div className="w-24">
                    <Progress value={87} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>DB</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Database</div>
                      <div className="text-xs text-muted-foreground">
                        Backups
                      </div>
                    </div>
                  </div>
                  <div className="w-24">
                    <Progress value={98} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm">View all</Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Recent transactions table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payments and orders</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              See all
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="font-medium">{t.id}</div>
                    <div className="text-xs text-muted-foreground">
                      Online purchase
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar>
                        {t.avatar ? (
                          <AvatarImage src={t.avatar} />
                        ) : (
                          <AvatarFallback>
                            {t.user.split(" ")[0][0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-medium">{t.user}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{t.date}</TableCell>
                  <TableCell className="text-right">
                    ${t.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div
                      className={
                        "inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs " +
                        (t.status === "Completed"
                          ? "bg-green-50 text-green-600"
                          : t.status === "Processing"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-rose-50 text-rose-600")
                      }
                    >
                      {t.status}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
