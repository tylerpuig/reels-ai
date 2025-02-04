import React, { useState } from "react";
import { Alert, StyleSheet, View, Text } from "react-native";
import { supabase } from "../../lib/supabase";
import { Button, Input } from "@rneui/themed";
import { trpc } from "../../trpc/client";
import { useSessionStore } from "@/hooks/useSession";
import { APP_URL } from "../../constants/app";
import { type Session } from "@supabase/supabase-js";

export default function Auth() {
  const { setSession } = useSessionStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function createNewUser(session: Session) {
    try {
      if (!session?.user?.id) return;
      console.log(session);
      await fetch(`${APP_URL}/newUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          name: "name",
          email: session?.user?.email,
        }),
      });
    } catch (err) {}
  }

  // const createNewUser = trpc.user.newUser.useMutation();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    try {
      setLoading(true);
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) Alert.alert(error.message);
      if (!session?.user?.id) return;
      setSession(session);
      await createNewUser(session);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.companyName}>Reels AI</Text>
      <Text style={styles.subtitle}>Welcome back!</Text>
      <Text style={styles.subtitle}>Signup or login to continue.</Text>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          labelStyle={styles.inputLabel}
          inputStyle={styles.inputText}
          leftIcon={{ type: "font-awesome", name: "envelope", color: "white" }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor="#888"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          labelStyle={styles.inputLabel}
          inputStyle={styles.inputText}
          leftIcon={{ type: "font-awesome", name: "lock", color: "white" }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor="#888"
          autoCapitalize={"none"}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title="Sign in"
          disabled={loading}
          onPress={() => signInWithEmail()}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Button
          title="Sign up"
          disabled={loading}
          onPress={() => signUpWithEmail()}
          buttonStyle={styles.secondaryButton}
          titleStyle={styles.secondaryButtonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  companyName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 18,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  inputLabel: {
    color: "white",
    marginBottom: 8,
  },
  inputText: {
    color: "white",
  },
  button: {
    backgroundColor: "#3498db",
    borderRadius: 8,
    padding: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#3498db",
  },
  secondaryButtonText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "600",
  },
});
