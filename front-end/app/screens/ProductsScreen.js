import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import BottomTabBar from "../components/BottomTabBar";
import { useState } from "react";

export default function ProductsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      {/* Category Tabs */}
      <View style={{ flex: 1 }}>
        <Text>Products Screen</Text>
      </View>

      {/* Bottom Tab Bar */}
      <BottomTabBar />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
});
