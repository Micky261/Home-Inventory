<?php

namespace App\Models;

class Tag
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function getAll()
    {
        $stmt = $this->db->query('SELECT * FROM tags ORDER BY name');
        return $stmt->fetchAll();
    }

    public function getById($id)
    {
        $stmt = $this->db->prepare('SELECT * FROM tags WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function getByName($name)
    {
        $stmt = $this->db->prepare('SELECT * FROM tags WHERE name = :name');
        $stmt->execute([':name' => $name]);
        return $stmt->fetch();
    }

    public function create($name, $color = '#3498db')
    {
        // Check if tag already exists
        $existing = $this->getByName($name);
        if ($existing) {
            return $existing['id'];
        }

        $stmt = $this->db->prepare('INSERT INTO tags (name, color) VALUES (:name, :color)');
        $result = $stmt->execute([':name' => $name, ':color' => $color]);

        return $result ? $this->db->lastInsertId() : false;
    }

    public function update($id, $name, $color)
    {
        $stmt = $this->db->prepare('UPDATE tags SET name = :name, color = :color WHERE id = :id');
        return $stmt->execute([':id' => $id, ':name' => $name, ':color' => $color]);
    }

    public function delete($id)
    {
        // Delete tag and all associations (CASCADE will handle item_tags)
        $stmt = $this->db->prepare('DELETE FROM tags WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }

    public function getItemTags($itemId)
    {
        $stmt = $this->db->prepare('
            SELECT t.* FROM tags t
            INNER JOIN item_tags it ON t.id = it.tag_id
            WHERE it.item_id = :item_id
            ORDER BY t.name
        ');
        $stmt->execute([':item_id' => $itemId]);
        return $stmt->fetchAll();
    }

    public function setItemTags($itemId, $tagIds)
    {
        // Remove all existing tags for this item
        $stmt = $this->db->prepare('DELETE FROM item_tags WHERE item_id = :item_id');
        $stmt->execute([':item_id' => $itemId]);

        // Add new tags
        if (!empty($tagIds)) {
            $stmt = $this->db->prepare('INSERT INTO item_tags (item_id, tag_id) VALUES (:item_id, :tag_id)');
            foreach ($tagIds as $tagId) {
                $stmt->execute([':item_id' => $itemId, ':tag_id' => $tagId]);
            }
        }

        return true;
    }
}
