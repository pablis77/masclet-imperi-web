from tortoise import fields, models
from tortoise.contrib.pydantic import pydantic_model_creator
from datetime import datetime


class Listado(models.Model):
    """
    Modelo para los listados personalizados de animales
    """
    id = fields.IntField(pk=True)
    nombre = fields.CharField(max_length=255, null=False)
    descripcion = fields.TextField(null=True)
    categoria = fields.CharField(max_length=100, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    created_by = fields.ForeignKeyField("models.User", related_name="listados_creados", null=True)
    is_completed = fields.BooleanField(default=False)
    
    # Relación muchos a muchos con Animales
    animales = fields.ManyToManyField(
        "models.Animal",
        through="listado_animal",
        related_name="listados",
        forward_key="animal_id",
        backward_key="listado_id"
    )
    
    class Meta:
        table = "listados"
        ordering = ["-created_at"]
    
    def __str__(self):
        return f"{self.nombre} - {self.created_at.strftime('%d/%m/%Y')}"


class ListadoAnimal(models.Model):
    """
    Modelo de relación entre Listados y Animales
    Permite almacenar notas específicas para cada animal en un listado
    """
    id = fields.IntField(pk=True)
    listado = fields.ForeignKeyField("models.Listado", related_name="listado_animales")
    animal = fields.ForeignKeyField("models.Animal", related_name="animal_listados")
    notas = fields.TextField(null=True)
    estado = fields.CharField(max_length=10, default="NO", null=True)  # OK o NO
    observaciones = fields.TextField(null=True)
    
    class Meta:
        table = "listado_animal"
        unique_together = (("listado_id", "animal_id"),)
    
    def __str__(self):
        return f"Listado {self.listado_id} - Animal {self.animal_id}"


# NOTA: Hemos eliminado temporalmente la creación de modelos Pydantic
# debido a problemas de compatibilidad con Pydantic V2.
# Usaremos los esquemas definidos en app/schemas/listado.py en su lugar.

# Este comentario es para que se sepa que es intencional, no un error de omisión.

# Para futuras implementaciones, considerar:
# 1. Hacer downgrade de Pydantic a V1
# 2. Actualizar Tortoise ORM a una versión compatible con Pydantic V2
# 3. Usar SQLAlchemy en lugar de Tortoise ORM
