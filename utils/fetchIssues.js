export async function fetchIssues() {
    try {
        const response = await fetch('/api/issues');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch issues:", error);
        return [];
    }
}