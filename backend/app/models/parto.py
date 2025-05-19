"""
Modelo para partos de animales.

NOTA IMPORTANTE: Este archivo está desactivado completamente.
El modelo Part está definido en app.models.animal.Part y utilizamos ese en su lugar
para evitar conflictos de duplicación de modelos.

Este archivo se mantiene solo como referencia, pero no se usa en la aplicación.
"""

# El modelo original (desactivado) estaba definido así:
# from tortoise import fields, models
#
# class Part(models.Model):
#     # Modelo de parto
#     data = fields.DateField()
#     animal = fields.ForeignKeyField("models.Animal", related_name="partos")
#     genere_fill = fields.CharField(max_length=10)  # M/F/esforrada
#     estat_fill = fields.CharField(max_length=3)  # OK/DEF
#     numero_part = fields.IntField()
#     observacions = fields.TextField(null=True)
#     created_at = fields.DatetimeField(auto_now_add=True)
#     updated_at = fields.DatetimeField(auto_now=True)
#
#     class Meta:
#         table = "partos"
#
#     async def to_dict(self):
#         # Convierte el parto a un diccionario
#         result = {
#            "id": self.id,
#            "animal_id": self.animal_id,
#            "data": self.data.strftime("%d/%m/%Y"),
#            "genere_fill": self.genere_fill,
#            "estat_fill": self.estat_fill,
#            "numero_part": self.numero_part,
#            "observacions": self.observacions if hasattr(self, "observacions") else None,
#        }
#        
#        # Añadir nombre del animal si está disponible
#        if hasattr(self, "animal") and self.animal:
#            try:
#                await self.fetch_related("animal")
#                result["animal_nom"] = self.animal.nom
#            except Exception:
#                pass
#                
#        return result
#    
#    async def save(self, *args, **kwargs):
#        # Sobreescribe el método save para validar que solo las hembras puedan tener partos.
#        # Obtener el animal asociado si no está ya en el objeto
#        if hasattr(self, "animal") and self.animal:
#            animal = self.animal
#        else:
#            from app.models.animal import Animal
#            animal = await Animal.get(id=self.animal_id)
#            
#        # Validar el género
#        from app.models.animal import Genere
#        if animal.genere != Genere.FEMELLA:
#            raise ValueError("Solo las hembras pueden tener partos")
#            
#        return await super().save(*args, **kwargs)
#        
#    @classmethod
#    async def validate_animal_gender(cls, animal):
#        # Valida que solo las hembras puedan tener partos.
#        from app.models.animal import Genere
#        if animal.genere != Genere.FEMELLA:
#            raise ValueError("Solo las hembras pueden tener partos")