package com.backend.sauvibe.announcement.manager;

import com.backend.sauvibe.announcement.domain.AnnouncementResponse;

/**
 * @author Ömer Asaf Balıkçı
 */
public interface AnnouncementManager {

  AnnouncementResponse getLatestAnnouncement();
}
