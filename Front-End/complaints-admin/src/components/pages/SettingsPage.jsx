import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Monitor, Smartphone, Tablet } from "lucide-react";

/* -------------------- MOCK DATA -------------------- */

const activeSessions = [
  {
    id: 1,
    device: "Windows Desktop",
    icon: Monitor,
    location: "New York, USA",
    lastActive: "Active now",
    current: true,
  },
  {
    id: 2,
    device: "iPhone 14",
    icon: Smartphone,
    location: "New York, USA",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: 3,
    device: "iPad Pro",
    icon: Tablet,
    location: "Boston, USA",
    lastActive: "1 day ago",
    current: false,
  },
];

export default function SettingsPage() {
  /* Account */
  const [fullName, setFullName] = useState("Admin User");
  const [email] = useState("admin@example.com");
  const [role] = useState("Admin");

  /* Security */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailLoginAlerts, setEmailLoginAlerts] = useState(true);

  /* Notifications */
  const [newComplaint, setNewComplaint] = useState(true);
  const [statusUpdated, setStatusUpdated] = useState(true);
  const [escalated, setEscalated] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  const handleSaveProfile = () => {
    console.log("Profile saved");
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Password updated");
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, security, and notification preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* ACCOUNT */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={email} readOnly className="bg-muted" />
                </div>
              </div>

              <div className="space-y-2 max-w-xs">
                <Label>Role</Label>
                <Input value={role} readOnly className="bg-muted" />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Management</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <Input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button onClick={handleUpdatePassword}>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Security</CardTitle>
              <CardDescription>
                Additional security controls for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security at login
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Login Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Receive alerts for new login attempts
                  </p>
                </div>
                <Switch
                  checked={emailLoginAlerts}
                  onCheckedChange={setEmailLoginAlerts}
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Devices currently signed in to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSessions.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between border rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{s.device}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.location} · {s.lastActive}
                        </p>
                      </div>
                    </div>
                    {!s.current && (
                      <Button variant="outline" size="sm">
                        Sign out
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complaint Notifications</CardTitle>
              <CardDescription>
                Control when you are notified about complaints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>New complaints submitted</Label>
                <Switch
                  checked={newComplaint}
                  onCheckedChange={setNewComplaint}
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>Complaint status updated</Label>
                <Switch
                  checked={statusUpdated}
                  onCheckedChange={setStatusUpdated}
                />
              </div>
              <div className="flex justify-between items-center">
                <Label>Complaints escalated</Label>
                <Switch checked={escalated} onCheckedChange={setEscalated} />
              </div>
              <div className="flex justify-between items-center">
                <Label>Weekly summary</Label>
                <Switch
                  checked={weeklySummary}
                  onCheckedChange={setWeeklySummary}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Choose how notifications are delivered
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
                <Label>Email notifications</Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={inAppNotifications}
                  onCheckedChange={setInAppNotifications}
                />
                <Label>In-app notifications</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
