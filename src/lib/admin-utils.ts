import { supabase } from "./supabase";

export async function setupAdminUser(email: string): Promise<boolean> {
  try {
    // First, find the user by email
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .single();

    if (userError) {
      console.error("Error finding user:", userError);
      return false;
    }

    if (!userData) {
      console.error("User not found with email:", email);
      return false;
    }

    // Update the user's role to admin
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("user_id", userData.user_id);

    if (updateError) {
      console.error("Error updating user role:", updateError);
      return false;
    }

    console.log(`User ${email} has been set as admin`);
    return true;
  } catch (error) {
    console.error("Error in setupAdminUser:", error);
    return false;
  }
}