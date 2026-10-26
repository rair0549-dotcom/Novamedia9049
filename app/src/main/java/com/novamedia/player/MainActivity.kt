package com.novamedia.player

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            NovaMediaApp()
        }
    }
}

data class MediaItemModel(
    val id: String,
    val title: String,
    val duration: String,
    val type: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NovaMediaApp() {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Videos", "Audio", "Folders", "Playlists")
    val dummyMedia = listOf(
        MediaItemModel("1", "Cinematic Drone Landscape", "03:45", "Video"),
        MediaItemModel("2", "Nature Flora & Blossom", "01:15", "Video"),
        MediaItemModel("3", "Ambient Electronic Melody", "02:30", "Audio"),
        MediaItemModel("4", "Lo-Fi Acoustic Guitar", "04:12", "Audio")
    )

    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFF6366F1),
            background = Color(0xFF0B0F19),
            surface = Color(0xFF131B2E),
            onPrimary = Color.White,
            onBackground = Color(0xFFF1F5F9),
            onSurface = Color(0xFFE2E8F0)
        )
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = "Nova Media",
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF818CF8)
                        )
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color(0xFF0B0F19)
                    )
                )
            },
            containerColor = Color(0xFF0B0F19)
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                TabRow(
                    selectedTabIndex = selectedTab,
                    containerColor = Color(0xFF131B2E),
                    contentColor = Color(0xFF818CF8)
                ) {
                    tabs.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            text = { Text(title) }
                        )
                    }
                }

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(dummyMedia) { item ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = Color(0xFF1E293B)
                            )
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = item.title,
                                        fontWeight = FontWeight.SemiBold,
                                        fontSize = 16.sp,
                                        color = Color.White
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = "${item.type} • ${item.duration}",
                                        fontSize = 13.sp,
                                        color = Color(0xFF94A3B8)
                                    )
                                }
                                Button(
                                    onClick = { },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFF6366F1)
                                    ),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Play")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
